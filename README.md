# Crossmint

## Approach to the astral object cross

The idea when making the cross is to use the Crossmint API to get the cross data (the goal) based on the candidate_id and then use that data to make the cross automatically.

It was coded using an extensible approach where it is possible to set up an AstralCrosser class that will do the crosser considering the candidate_id. If, in the future, those properties change, it will be easy to add those to the class and use them to set the goal.

## Astral Object Class and design patterns

First, for creating the astral object, I used a straightforward factory pattern to generate them based of the parameters received.

Then, for consuming the cross API and, later, verifying saved values, I used the strategy pattern where each astral is able to do those methods doing dynamics implementations.

## Backoff Strategy for consuming the Crossmint API

When consuming the Crossmint API, there is a limit to the number of requests to consume. There are not details in the docs, so I used a backoff strategy to wait when there is a 429 response error, and also increasing the time to wait for future cases.

## Additional Features

Prettier, eslint and husky are added to the project. That would lead to writing code more consistently, as well as catching some errors and saving some time avoiding the responsibility and decision of manually formatting it.
