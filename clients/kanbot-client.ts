import Discord from 'discord.js';
import { KanbotCommands, KanbotRequest } from '../application/constants/kanbot-commands';
import { KanbanBoard } from '../application/kanban-board';
import { KanbotConfiguration } from '../application/kanbot-configuration';
import { Task } from '../application/models/task';
import { Kanban } from '../application/namespaces/kanban-board';
import * as help from '../util/commands.json';

export class KanbotClient {

    private signal: string;
    private botName: string;
    private token: string;

    constructor(kanbotConfiguration: KanbotConfiguration,
        private discordClient: Discord.Client,
        private board: KanbanBoard = new KanbanBoard()) {
        
        this.signal = kanbotConfiguration.signal;
        this.botName = kanbotConfiguration.botName;
        this.token = kanbotConfiguration.token;
    }

    /**
     * handleLogin
     */
    public handleLogin(): void {
        this.discordClient.login(this.token).then(value => console.log(value));
    }

    /**
     * handleReady
     */
    public handleReady(): void {
        this.discordClient.on('ready', () => console.log(`${this.botName} is online!`));
    }

    public handleMessage(): void {
        this.discordClient.on('message', (message: Discord.Message) => this.handleRequest(message));
    }

    /**
     * handleRequest
     * @param message DiscordMessage
     */
    public handleRequest(message: Discord.Message): void {
        const channel = message.channel;
        const caller: string = message.author.username;

        if (message.author.bot) return;
        if (channel.type === Discord.ChannelType.DM) return;

        // Parse command, and check.
        const inputs: string[] = message.content.split(' -');
        if (inputs[0] !== this.signal) return;

        // display board
        if (inputs.length === 1) {
            this.displayBoard(message, caller);
            return;
        }

        console.warn(inputs[1]);

        const request: KanbotRequest = KanbotRequest.parseString(inputs[1]);
        switch (request.command) {
            case KanbotCommands.ADD:
                this.addToBacklog(message, request.taskName);
                break;
            case KanbotCommands.HELP:
                if (
                    message.channel &&
                    (message.channel.type === Discord.ChannelType.GuildText ||
                     message.channel.type === Discord.ChannelType.AnnouncementThread)
                ) {
                    message.channel.send({ embeds: [this.helpList(message)] });
                }
                break;
            case KanbotCommands.REMOVE:
                this.removeItem(message, request.taskName);
                break;
            case KanbotCommands.START:
                this.startItem(message, request.taskName);
                break;
            case KanbotCommands.COMPLETE:
                this.completeItem(message, request.taskName);
                break;
            case KanbotCommands.CLEAR:
                this.board.clearBoard();
                if (
                    channel.type === Discord.ChannelType.GuildText ||
                    channel.type === Discord.ChannelType.GuildAnnouncement ||
                    channel.type === Discord.ChannelType.PublicThread ||
                    channel.type === Discord.ChannelType.PrivateThread
                ) {
                    (channel as Discord.TextChannel | Discord.NewsChannel | Discord.ThreadChannel).send({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setColor(3447003)
                                .setDescription(`Board cleared by: ${message.author.username}`)
                        ]
                    });
                }
                break;
            default:
                if (
                    channel.type === Discord.ChannelType.GuildText ||
                    channel.type === Discord.ChannelType.GuildAnnouncement ||
                    channel.type === Discord.ChannelType.PublicThread ||
                    channel.type === Discord.ChannelType.PrivateThread
                ) {
                    (channel as Discord.TextChannel | Discord.NewsChannel | Discord.ThreadChannel).send({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setColor(3447003)
                                .setDescription(`Invalid request: ${request.command} ${request.taskName}`)
                        ]
                    });
                }
                break;
        }
    }

    private displayBoard(message: Discord.Message, caller: string) {
        if (
            message.channel &&
            (message.channel.type === Discord.ChannelType.GuildText ||
             message.channel.type === Discord.ChannelType.GuildAnnouncement ||
             message.channel.type === Discord.ChannelType.PublicThread ||
             message.channel.type === Discord.ChannelType.PrivateThread ||
             message.channel.type === Discord.ChannelType.AnnouncementThread)
        ) {
            (message.channel as Discord.TextChannel | Discord.NewsChannel | Discord.ThreadChannel).send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor(3447003)
                        .setDescription(`${this.botName}!`)
                        .addFields(
                            { name: 'Project Backlog ', value: `\`\`\`${this.displayColumn(this.board.backlog.getTasks())}\`\`\`` },
                            { name: 'In Progress ', value: `\`\`\`${this.displayColumn(this.board.inProgress.getTasks())}\`\`\`` },
                            { name: 'Completed Tasks', value: `\`\`\`${this.displayColumn(this.board.complete.getTasks())}\`\`\`` },
                            { name: "I've been called by ", value: caller }
                        )
                ]
            });
        }
    }

    private displayColumn(from: Task[]) {
        return from.map(task => task.toString()).join('\n');
    }

    private addToBacklog(message: Discord.Message, taskName: string) {
        const author: string = message.author.username;
        if (this.board.containsTask(taskName)) {
            if (
                message.channel &&
                (message.channel.type === Discord.ChannelType.GuildText ||
                 message.channel.type === Discord.ChannelType.GuildAnnouncement ||
                 message.channel.type === Discord.ChannelType.PublicThread ||
                 message.channel.type === Discord.ChannelType.PrivateThread ||
                 message.channel.type === Discord.ChannelType.AnnouncementThread)
            ) {
                (message.channel as Discord.TextChannel | Discord.NewsChannel | Discord.ThreadChannel).send({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setColor(3447003)
                            .setDescription(`Not adding task ${taskName} because it already exists in the kanban board.`)
                    ]
                });
            }
            return;
        }

        if (
            message.channel &&
            (message.channel.type === Discord.ChannelType.GuildText ||
             message.channel.type === Discord.ChannelType.GuildAnnouncement ||
             message.channel.type === Discord.ChannelType.PublicThread ||
             message.channel.type === Discord.ChannelType.PrivateThread ||
             message.channel.type === Discord.ChannelType.AnnouncementThread)
        ) {
            (message.channel as Discord.TextChannel | Discord.NewsChannel | Discord.ThreadChannel).send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor(3447003)
                        .setDescription(`${taskName} has been added to the Backlog by ${author}`)
                ]
            });
        }
        this.board.addToBacklog(new Task(taskName, author));
    }
    private helpList(message: Discord.Message): Discord.EmbedBuilder {
        const Help = new Discord.EmbedBuilder()
            .setColor('#0074E7')
            .setTitle('List of Board Commands')
            .addFields(
                { name: `${help.view.command}`, value: `${help.view.desc}` },
                { name: `${help.add.command}`, value: `${help.add.desc}` },
                { name: `${help.remove.command}`, value: `${help.remove.desc}` },
                { name: `${help.clearTask.command}`, value: `${help.clearTask.desc}` },
                { name: `${help.startTask.command}`, value: `${help.startTask.desc}` },
                { name: `${help.completeTask.command}`, value: `${help.completeTask.desc}` }
            );
        return Help;
    }

    private async removeItem(message: Discord.Message, item: string): Promise<Discord.Message | Discord.Message[]> {
        try {
            const match: Task = await this.board.findMatch(item);
            this.board.remove(match);
            return (message.channel as Discord.TextChannel | Discord.NewsChannel | Discord.ThreadChannel).send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor(3447003)
                        .setDescription(`Removed ${item} by ${message.author.username}`)
                ]
            });
        } catch (error) {
            console.log(error);
            return (message.channel as Discord.TextChannel | Discord.NewsChannel | Discord.ThreadChannel).send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor(3447003)
                        .setDescription('No matching item found, nothing removed.')
                ]
            });
        }
    }

    private startItem(message: Discord.Message, item: string) {
        this.forward(item, this.board.backlog, this.board.inProgress, message);
    }

    private completeItem(message: Discord.Message, item: string) {
        this.forward(item, this.board.inProgress, this.board.complete, message);
    }

    private forward(item: string, from: Kanban.Board.Column, to: Kanban.Board.Column, message: Discord.Message) {
        const task: Task | undefined = from.findMatch({ name: item } as Task);

        if (task instanceof Task) {
            from.remove(task);
            to.add(task);
            (message.channel as Discord.TextChannel | Discord.NewsChannel | Discord.ThreadChannel).send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor(3447003)
                        .setDescription(`${item} moved from "${from.getName()}" to "${to.getName()}" by: ${message.author.username}`)
                ]
            });
        }
    }
}