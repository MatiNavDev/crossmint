# crossmint

## Approach to the astral object cross

The idea when resolving making the cross is to use the crossmint API to get the cross data (the goal) base on the candidate_id and then use that data to make the cross in an automatic way.

The idea is to make an extensible approach where it is possible to set up a AstralCrosser class that will do the crosser taking in mind the candidate_id. It could support adding more properties where the goal would be set in base of those properties and then the crosser would be able to make the cross.

## Astral Object Class and design patterns

First, for creating the astral object, I used a very simple factory pattern that will generate them in base of the params received.

Then, for consuming the cross API and, later, verifying saved values, I used the strategy pattern where each astral is able to do it dynamically implementing the methods with different implmentaions.

## Backoff Strategy for consuming the crossmint API

When consuming the crossmint API, there is a limit in the amount of request to consume. The limits are not explicitally in the docs, so I used a backoff strategy to wait when there is a 429 response error, and also increasing the time to wait for future cases.
