# Realtime Applications Service (RTAS)

![bouncing balls example](https://github.com/NicholasHallman/RTAS/blob/main/resources/JxrO4SCmO1.gif)

RTAS is a platform for creating realtime web applications easily and quickly with WebSockets backed by the Entity Component Systems bitecs.

## Plugins

Your application runs as a plugin on the service. The plugin class has input functions called by the service to update the state, or get the systems of your application. These functions are:
 - `start()` called when the plugin is attached to the service.
 - `connect() -> eid` called when a user connects to your server. calling `super.connect()` will create an entity to represent the connection.
 - `disconnect(eid)` called when a user disconnects from your server.
 - `updateResource(eid, resource: ResourceMessage)` called when a user updates their resource store.
 - `get pipeline() -> Systems[]` defines the systems implemented by your app.
 - `get schedule() -> 'frame' | 'input'` defines the update schedule of the app.

## Standard Plugin

The standard plugin comes with systems and components that you can use in your app.

## Components
 - `Networked` an entity with a Networked component will be serialized and sent to clients at the end of an update.

## Systems
 - `serializeAndSend` this system serializes networked entities and sends them to connected clients.

## Types

```js
// ResourceMessage
{
   "diff": {
        // updates the entity's resource
    },  
    "full": {
        // overwrites the entity's resource.
    }
}
```

## Examples

The bouncing-balls and cursor-example plugins demonstrate how to use the service lifecycle functions and example systems. 

Server examples can be run like so

 - `npm run start -- --app cursor-example`  
 - `npm run start -- --app bouncing-example`

then modify the demo/index.html file to point to the component that matches the example.

 - for cursor-example add `<cursor-manager></cursor-manager>`
 - for bouncing-example add `<bouncing-balls></bouncing-balls>`


then, in a new terminal window, run: `npm run demo`

## Reconnection

When a client disconnects from the service the core plugin will serialize their components and cache them. When the client reconnects with the entity id they were assigned previously the core plugin will deserialize their data and bring it back into the world.

# Frontend Library

This package has a helper library you can use on the client side to communicate with RTAS. The library is in `./src/frontend/index.js` and the library is used by `./demo/bouncing-example.js` and `./demo/cursor-example.js`

