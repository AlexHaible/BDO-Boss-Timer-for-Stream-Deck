import streamDeck from "@elgato/streamdeck";

import { NextBoss } from "./actions/next-boss";

streamDeck.logger.setLevel("info");

streamDeck.actions.registerAction(new NextBoss());

streamDeck.connect();
