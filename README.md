# opencloud.js

[![Experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

## Table of Contents

- [About](#about)
- [Usage](#usage)
    - [DataStores](#datastores)
        - [GetAsync](#ds-getasync)
        - [SetAsync](#ds-setasync)
        - [IncrementAsync](#ds-incasync)
        - [RemoveAsync](#ds-removeasync)
        - [ListDataStoresAsync](#ds-getkeys)
    - [MessagingService](#messages)
    - [Place Management](#place-manage)
        - [PublishAsync](#pm-publish)
        - [SaveAsync](#pm-save)
    - [Pagination](#pagination)
        - [GetNextPageAsync](#p-gnpa)
        - [GetPreviousPageAsync](#p-gppa)

## About <a name = "about"></a>

`opencloud.js` is an api wrapper meant to simplify the complexities with requesting to roblox's opencloud apis. This wrapper is built to mimic roblox's luau functions.

### Installing

Use [node package manager](https://npmjs.com/) to install the package for use.

```
npm i @itsrune/opencloud.js
```

## Usage <a name = "usage"></a>

To start, you need to create a new Universe using the package. This is simple as demonstrated below:
```js
const OpenCloud = require('@itsrune/opencloud.js');
const Universe = new OpenCloud(000000, "API_KEY");
```

This `Universe` class holds services within itself and caches your api key, so you don't have to reuse it over and over again.

## DataStores <a name = "datastores"></a>

Datastores work just like with roblox. First we need to get the datastore itself then we are able to use it.
```js
const DataStore = Universe.DataStoreService.GetDataStore("Coins");
```

### GetAsync <a name = "ds-getasync"></a>
Once you've gotten the datastore, you can then increment / set / get async to it. All requests to the api are asynchronous, make sure you handle their Promise's appropriately.

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

Too lazy to go into studio? Want to list your datastores on a front-end application? No problem! `ListDataStoresAsync` would be your function for this!
```js
try {
    const DataStorePages = await Universe.DataStoreService.ListDataStoresAsync();
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

## Place Management <a name = "place-manage"></a>

The place management api is a powerful api that allows developers to publish / save roblox games to an experience's place from an external source.

### PublishAsync <a name = "pm-publish"></a>

Publishing a place is as simple as it seems. Go to the Place Management service within the Universe (`Universe.PlaceManagementService`) and call PublishAsync with a `placeId` and `routeToRbxFile`.

```js
try {
    await PlaceManagementService.PublishAsync(0000, `${__dirname}/place.rbxlx`);
} catch(err) {
    console.error(err);
}
```

### SaveAsync <a name = "pm-save"></a>

SaveAsync works just like PublishAsync except instead it saves the place rather than instantly publishing it. This takes the same parameters as [PublishAsync](#pm-publish)

```js
try {
    await PlaceManagementService.SaveAsync(0000, `${__dirname}/place.rbxlx`);
} catch(err) {
    console.error(err);
}
```

## Pagination <a name = "pagination"></a>

Pagination is the process that is used to divide a large data into smaller discrete pages. Roblox uses pagination with almost all apis that require a `Cursor` parameter within their urls. 

### GetNextPageAsync <a name = "p-gnpa"></a>
This function is responsible for getting the next page of data and returning both it's data and the cursor associated to that data. This data will always be returned as an Array.

```js
try {
    const DataStore = (new Universe(00000, "APIKEY")).DataStoreService;
    const pages = await DataStore.ListDataStoresAsync();

    const [nextPage, cursor] = await pages.GetNextPageAsync();
} catch(err) {
    console.error(err);
}
```

### GetPreviousPageAsync <a name = "p-gppa"></a>
Unlike `GetNextPageAsync`, this function gets the previous page. Note: Using this function before grabbing the next page will throw an error!

```js
try {
    const DataStore = (new Universe(00000, "APIKEY")).DataStoreService;
    const pages = await DataStore.ListDataStoresAsync();

    const [nextPage, cursor] = await pages.GetNextPageAsync();
    const [prevPage, cursor] = await pages.GetPreviousPageAsync();
} catch(err) {
    console.error(err);
};
```