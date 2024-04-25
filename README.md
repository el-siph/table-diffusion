# table-diffusion

Table Diffusion is a real-time backend solution for various French Deck card games. It aims to simulate a variety of interactions with a deck of cards, such as piling cards at the center of a table, to shuffling and dividing the pile into individual hands for each player. There is even a "slap" action specifically for Egyptian Ratscrew.

When deployed, clients can contact the server via WebSockets using a variety of predefined actions (listed in `src/actions.ts`). The server has no internal logic, allowing the client app to implement their rulesets by chaining server actions.

**(This project is currently unfinished.)**

---

## To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

To compile and run:

```bash
tsc && bun run dist/index.js
```

---

## Interacting with the server:

WebSocket messages are sent to `ws://localhost:8080/dealer`. A full list of available actions and expected payloads are listed in `src/actions.ts`.

### Examples

#### Joining (or Creating) a Table

```bash
{
    "action": "joinTable",
    "payload": {
        "playerName": "AAA",
        "tableId": "JIOI"
    }
}
```

(This action returns the `tableId` and randomly-generated `playerId` to the client.)

#### Generating a CardDeck for the Table

```bash
{
    "action": "generateTableDeck",
    "payload": {
        "tableId": "JIOI"
    }
}
```

#### Dividing the CardDeck among all Players at the Table

```bash
{
    "action": "divideTableDeck",
    "payload": {
        "tableId": "JIOI"
    }
}
```
