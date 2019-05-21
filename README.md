# Generals

A multiplayer turn-based tactical board game written in Node.js platform. It is a cooperative game involving competitions between two opposing teams. Players are expected to communicate with teammates and form strategies to win the game.

![alt text](/doc/index.png?raw=true "index")

## Instructions

1. Navigate to project's root folder, then launch the server with the command:

    ```bash
    vagrant up
    ```

2. Visit [http://localhost:8080](http://localhost:8080) in 2+ tabs/clients to begin playing

## Technology Stack

![alt text](/doc/move.png?raw=true "index")

### Front-end

- HTML, CSS, JavaScript
- Nginx

The front-end is a single web page built with HTML, CSS, and JavaScript. It performs basic validations on user information and game status, and receives data from the server to display user interface, chat messages, and game visuals. Nginx is used to deploy the application and serve static content.

### Back-end

- Node.js that uses Express.js and Socket.IO
- PostgreSQL database

The back-end is built in Node.js platform that uses Express.js framework and Socket.IO library. This combination allows real-time, asynchronous communication between the server and clients, which is essential for this project as we are constantly updating the chat and game status. PostgreSQL is used to record game stats for end game evaluation and status. All events on the game board are sent to the back-end to process and validate. After evaluation, relevant information gets sent back to the client side to handle and display.

## Game Rules

![alt text](/doc/attack.png?raw=true "index")

- Chat has global and team rooms to switch between, and players can communicate with teammates or all clients connected to the server at anytime.
- Each team has ten units, all of which perform two actions: attack and move.
  - One action costs 1 AP, and each unit has 2 AP per turn. Therefore, one unit can either attack twice, move twice, or do a combination of both in one turn.
- All team members can control any of their team’s units except the ones currently selected by other teammates.
- Each turn has two phases: planning phase and execution phase.
  - Planning phase: both teams can control their own units to perform actions in which only the teammates can see.
  - Execution phase, players are not allowed to anything, and all actions done during the planning phase are revealed to both teams, including the health points and the movements of all units.
- Due to the unique turn mechanism, certain situations may appear. The following are the rules for those special cases:
  - In planning phase, if you attack a location occupied by an enemy unit, and that unit moves, the attack will miss. Likewise, if you attack an empty location, and an enemy unit moves to that location, the attack will hit.
  - In planning phase, if you move a unit to a location, and an enemy unit also moves to that location, both units die.

## Features

- Movement
- Attack
- Turn cycles
- Game completion
- Game restarting
- Chat
- Chat rooms
- Backend validation for movement and attacks
- Database for tracking gameplay stats
- Nginx front end server
- Generator for play field
- Generator for units

## Contributors

- Rohm Laxton
- Kent Lee
- Ankit Dassor
- Nicole Thomas