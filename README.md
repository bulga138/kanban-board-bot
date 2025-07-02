# Foolish Assistant for Ridiculous Tasks

:clipboard: A lightweight Kanban board bot, for your Discord! <br /><br />

![logo](fartbot.png)

## Getting started 

This is a bot for your Discord, so if you don't already have a Discord
register and download [here](https://discordapp.com/) <br />

If you are not familiar with a kanban board [here](https://leankit.com/learn/kanban/kanban-board/) is a great description by *leankit*

### This repository

clone this repository

```
$ git clone git@git:bulga138/kanban-board-bot.git
```

install the necessary node modules

```
$ pnpm install
```

create a bot through the discord developer portal and add your token in a file labeled `botconfig.json`

start the server!

```
$ pnpm run watch
```

## Documentation

Type the commands following `$fart` into your Discord chat box to launch the app.

|Command| Usage|
| ------------- |:-------------:|
| `$fart`| displays current kanban board|
|||
| `-help` | displays possible commands |
| `-add <"item">` | adds "item" into 'backlog'|
| `-remove <"id">` | remove item with "id" from 'backlog'|
| `-start <"id">` | move item with "id" from 'backlog' to 'in-progress'|
| `-complete <"id">` | move item with "id" from 'in-progress' to 'backlog'|
| `-clear` | clears the current board *use with caution*|

## Examples

`$fart` to display the board <br /><br />
![board](https://i.imgur.com/KkAgFms.png)<br /><br />

`$fart -add "Enjoy cookies"` to add to the backlog <br /><br />
![add-to-board](https://i.imgur.com/D7VfZDI.png)<br />

Made with :heart:
