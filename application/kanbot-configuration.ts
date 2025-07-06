import { BotConfiguration } from "./bot-configuration";

export class KanbotConfiguration extends BotConfiguration {

    private readonly commandPrefix: string;
    private readonly commandName: string;

    constructor(token: string, botName: string = 'Kanbot', commandPrefix: string = '$', commandName: string = 'kanbot') {
        super(botName, token);
        this.commandPrefix = commandPrefix;
        this.commandName = commandName;
    }

    public get signal(): string {
        return `${this.commandPrefix}${this.commandName}`;
    }
}