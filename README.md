# opencloud.js

## Table of Contents

- [About](#about)
- [Usage](#usage)
    - [DataStores](#datastores)
        - [GetAsync](#ds-getasync)
        - [SetAsync](#ds-setasync)
        - [IncrementAsync](#ds-incasync)
        - [RemoveAsync](#ds-removeasync)
        - [GetDataStores](#ds-getkeys)
    - [MessagingService](#messages)
    - [Place Management](#place-manage)

## About <a name = "about"></a>

`opencloud.js` is an api wrapper meant to simplify the complexities with requesting to roblox's opencloud apis. This wrapper is built to mimic roblox's luau functions.

### Installing

Use [node package manager](https://npmjs.com/) to install the package for use.

```
npm i @itsrune/opencloud.js
```

## Usage <a name = "usage"></a>

To start, I'll show you how to create a new universe.
```js
const OpenCloud = require('@itsrune/opencloud.js');
const Universe = new OpenCloud(000000, "API_KEY");
```

This `Universe` class holds services within itself and caches your api key, so you don't have to reuse it over and over again.

## DataStores <a name = "datastores"></a>

Datastores work just like with roblox. First we need to get the datastore itself then we are able to use it.
```js
const Universe = new OpenCloud(000000, "API_KEY");
const DataStore = Universe.DataStoreService.GetDataStore("Coins");
```

### GetAsync <a name = "ds-getasync"></a>
Once you've gotten the datastore, you can then increment / set / get async to it. All requests to the api are asynchronous, make sure you handle their `Promise`s appropriately.

```js
DataStore.GetAsync("my-datastore-key").then((myCoins) => {

}).catch(err => console.error);
```

### SetAsync <a name = "ds-setasync"></a>
To update a datastore entry, just use `SetAsync`.
```js
try {
    await DataStore.SetAsync("my-datastore-key", 100);
} catch(err) {
    console.error(err);
}
```

### IncrementAsync <a name = "ds-incasync"></a>
In this case we could use `IncrementAsync` to update this datastore due to `Coins` being an integer.
```js
try {
    await DataStore.IncrementAsync("my-datastore-key", 5); // Adds 5 coins.
} catch(err) {
    console.error(err);
}
```

### RemoveAsync <a name = "ds-removeasync"></a>

Let's say we want to delete an entry, how would we do that? Well, this is where `RemoveAsync` would be used.
```js
try {
    await DataStore.RemoveAsync("my-datastore-key");
} catch(err) {
    console.error(err);
}
```

### GetDataStores <a name = "ds-getkeys"></a>

Too lazy to go into studio? Want to list your datastores on a front-end application? No problem! `GetDataStores` would be your function for this!
```js
try {
    const DataStores = await Universe.DataStoreService.GetDataStores();
} catch(err) {
    console.error(err);
}
```
Note: This function will return the json data from the request, it will not be formatted. View the [documentation](https://create.roblox.com/docs/open-cloud/data-store-api#example) for more information on how it's formatted.

## Messaging Service <a name = "messages"></a>

Messaging via external applications are incredibly powerful when it comes to roblox apps. Example of use: You have an update coming up and want to alert users before a shutdown occurs.

At the moment `MessagingService` has only 1 asynchronous function, `PublishAsync`, which takes 2 string parameters; The topic and the message to send.

```js
const Universe = new OpenCloud(000000, "API_KEY");
const MessagingService = Universe.MessagingService;

try {
    await MessagingService.PublishAsync("Topic", "Hello World!");
} catch(err) {
    console.error(err);
};
```

## Place Management <a name = "place-manage"></a> [![Experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

Not Implemented for use.