<div align="center">
    <h1>opencloud.js</h1>
    <a href="https://www.npmjs.com/package/@itsrune/opencloud.js"><img alt="npm" src="https://img.shields.io/npm/v/@itsrune/opencloud.js?style=flat-square"></a>
    <a href="https://packagephobia.com/result?p=@itsrune/opencloud.js"><img alt="npm bundle size" src="https://img.shields.io/bundlephobia/min/@itsrune/opencloud.js?label=size&style=flat-square"></a>
    <img alt="GitHub" src="https://img.shields.io/github/license/ItsRune/opencloud.js?color=orange&style=flat-square">
    <!-- <a href="https://npmjs.com/package/@itsrune/opencloud.js"><img alt="npm" src="https://img.shields.io/npm/dw/@itsrune/opencloud.js?style=flat-square"></a> -->
    <br>
</div>

## Table of Contents

- [About](#about)
- [Usage](#usage)
    - [Universe](#universe)
        - [setApiKey](#u-setApiKey)
        - [setUniverseId](#u-setUniverseId)
    - [DataStores](#datastores)
        - [GetDataStore](#ds-get)
        - [GetOrderedDataStore](#ds-getordered)
        - [SetScope](#ds-scope)
        - [GetAsync](#ds-getasync)
        - [SetAsync](#ds-setasync)
        - [UpdateAsync](#ds-updateasync)
        - [IncrementAsync](#ds-incasync)
        - [RemoveAsync](#ds-removeasync)
        - [ListDataStoresAsync](#ds-getkeys)
        - [ListAsync](#ods-list)
    - [MessagingService](#messages)
        - [PublishAsync](#ms-publishasync)
    - [Place Management](#place-manage)
        - [PublishAsync](#pm-publish)
        - [SaveAsync](#pm-save)
    - [Pagination](#pagination)
        - [GetNextPageAsync](#p-gnpa)
        - [GetPreviousPageAsync](#p-gppa)
    - [Assets](#assets)
        - [GetOperation](#a-operation)
        - [SetCreator](#a-creator)
        - [SetPrice](#a-price)
        - [CreateAsset](#a-create)
        - [UpdateAsset](#a-update)

## About <a name = "about"></a>
`opencloud.js` is an api wrapper meant to simplify the complexities with requesting to roblox's opencloud apis. This wrapper is built to mimic roblox's LuaU functions.

<!-- ## Chains
Some functions are marked with a `Chains` tag. These are methods in which return the current class, allowing you to chain methods together. 

For example:
```js
Universe.Assets
    .SetCreator("Group", 00000000)
    .SetPrice(100)
    .CreateAsset(...[arguments]);
``` -->

### Installing

Use [node package manager](https://npmjs.com/) to install the package for use.

```
npm i @itsrune/opencloud.js
```

## Usage <a name = "usage"></a>
To start, you need to create a new Universe using the package. This is simple as demonstrated below:

`universeId` | `Number` | Id of the universe.
`apiKey` | `String` | The api key to use.

```js
const OpenCloud = require('@itsrune/opencloud.js');
const Universe = new OpenCloud(000000, "API_KEY");
```

## Universe <a name = "universe"></a>
The `Universe` class holds services within itself and caches your api key, so you don't have to reuse it over and over again, but you can also change specific options when you create it.

### Universe Options
<!-- `useDataStoreCache` | `Boolean` | Will cache values when they're changed / fetched. -->

| Option | Type | Description |
| -------- | -------- | -------- |
| `useMomentJs` | `Boolean` | Will convert any times to [Moment.js](https://momentjs.com/) classes. |
| `useDataStoreCache` | `Boolean` | Determines whether `DataStoreService` should cache keys / values. |
| `cacheUpdateInterval` | `Number` | Determines how often the cache should update. |
| `dataStoreScope` | `String` | Changes the scope of the DataStore. |
| `hideWarnings` | `Boolean` | Hides warnings from the console. |

```js
const myUniverse = new Universe(00000000, "API_KEY", {
    useMomentJs: false,
    useDataStoreCache: true,
    cacheUpdateInterval: 120000, // 2 minutes
    dataStoreScope: "global"
});
```

### setApiKey <a name = "u-setApiKey"></a> 
This function will overwrite the current `apiKey`

`Key` | `String` | The new api key.

```js
Universe.setApiKey("NEW-API-KEY");
```

### setUniverseId <a name = "u-setUniverseId"></a> 
This function will overwrite the current `universeId` for the new one. If you don't want that, I recommend creating a new universe.

`universeId` | `Number` | The new universe id.

```js
Universe.setUniverseId(00000);
```

## DataStores <a name = "datastores"></a>
Datastores work just like with roblox. First we need to get the datastore itself then we are able to use it.

### GetDataStore <a name = "ds-get"></a><a name = "ds-scope"></a> 

`dataStoreName` | `String` | Name of the datastore.
`scope` | `String` | Scope of the datastore.

```js
const CoinDataStore = Universe.DataStoreService.GetDataStore("Coins", "coins");
const GemsDataStore = Universe.DataStoreService.GetDataStore("Gems", "global");
```

### GetOrderedDataStore <a name = "ds-getordered"></a>

`dataStoreName` | `String` | Name of the datastore.
`scope` | `String` | Scope of the datastore.

```js
const coinOrderedDataStore = Universe.DataStoreService.GetOrderedDataStore("Coins", "coins");
```

### ListAsync <a name = "ods-list"></a>
Lists the entries in the datastore based off the sort order and filters. Returns a <a name="pagination">Pages</a> class.

`sortOrder` | `String` | The sort order of the datastore.
`limit` | `Number` | The limit of the datastore.
`filters` | `String` | The filters of the datastore.

```js
const myCoins = await coinOrderedDataStore.ListAsync("Asc", 10, "entry>=1&&entry<=10");
```

### SetScope <a name = "ds-scope"></a> 
This function will overwrite the current `scope` for the new one.

`scope` | `String` | The new scope.

```js
CoinDataStore.SetScope("global");
GemsDataStore.SetScope("global");
```

### GetAsync <a name = "ds-getasync"></a>
Once you've gotten the datastore, you can then increment / set / get async to it. All requests to the api are asynchronous, make sure you handle their Promise's appropriately.

`Key` | `String` | The key to fetch.

```js
try {
    const myCoins = await CoinDataStore.GetAsync("my-datastore-key");
    console.log(myCoins.data);
} catch(err) {
    console.error(err);
}
```

### SetAsync <a name = "ds-setasync"></a>
To update a datastore entry, just use `SetAsync`.

`Key` | `String` | The key to set.
`Value` | `any` | Value to set.

```js
try {
    await CoinDataStore.SetAsync("my-datastore-key", 100);
} catch(err) {
    console.error(err);
}
```

### UpdateAsync <a name = "ds-updateasync"></a>
`UpdateAsync` uses 2 parameters to update a datastore entry. The first parameter is the key, the second is a function that will be ran on the current value.

`Key` | `String` | The key to update.
`Function` | `function` | Function to run on the current value (must return a value aswell).

```js
try {
    await CoinDataStore.UpdateAsync("my-datastore-key", (oldValue) => {
        return oldValue + 100;
    });
} catch(err) {
    console.error(err);
}
```

### IncrementAsync <a name = "ds-incasync"></a>
In this case we could use `IncrementAsync` to update this datastore due to `Coins` being an integer.

`Key` | `String` | The key to increment.
`incrementBy` | `Number` | The value to increment by.

```js
try {
    await CoinDataStore.IncrementAsync("my-datastore-key", 5); // Adds 5 coins.
} catch(err) {
    console.error(err);
}
```

### RemoveAsync <a name = "ds-removeasync"></a>
Let's say we want to delete an entry, how would we do that? Well, this is where `RemoveAsync` would be used.

`Key` | `String` | The key to remove.

```js
try {
    await CoinDataStore.RemoveAsync("my-datastore-key");
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

### PublishAsync <a name = "ms-publishasync"></a>
`Topic` | `String` | The topic of the message.
`Message` | `String` | The message to send.

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

`placeId` | `Number` | Id of the place to publish to.
`routeToRbxFile` | `String` | File's location.

```js
try {
    await PlaceManagementService.PublishAsync(0000, `${__dirname}/place.rbxlx`);
} catch(err) {
    console.error(err);
}
```

### SaveAsync <a name = "pm-save"></a>
SaveAsync works just like PublishAsync except instead it saves the place rather than instantly publishing it. This takes the same parameters as [PublishAsync](#pm-publish)

`placeId` | `Number` | Id of the place to save to.
`routeToRbxFile` | `String` | File's location.

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

    const data = await pages.GetNextPageAsync();
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

    const nextData = await pages.GetNextPageAsync();
    const prevData = await pages.GetPreviousPageAsync();
} catch(err) {
    console.error(err);
};
```

## Assets <a name = "assets"></a>
This section allows for developers to upload assets to Roblox's library and manage them.

### GetOperationId <a name = "a-getopid"></a> 
Gets an operation's id by it's asset name. Caching is required.

```js
const operationId = Universe.Assets.GetOperationId("MyAsset");
```

### GetOperation <a name = "a-operation"></a>
Operations are automatically cached by this wrapper, you can access them by using `GetOperationId` with the asset's name. Then you can use this method to get the operation's information.

```js
Universe.Assets.GetOperation(operationId).then(console.log).catch(console.error);
```

### SetCreator <a name = "a-setcreator"></a> 
This method is required for using `CreateAsset`, it sets the creator of the asset.

`creatorType` | `String` | The type of creator to set. (User or Group)
`creatorId` | `Number` | The id of the creator.

```js
Universe.Assets.SetCreator("User", 000000);
```

### SetPrice <a name = "a-setprice"></a> 
This method is required for using `CreateAsset`, it sets the price of the asset.

`price` | `Number` | The price of the asset.

```js
Universe.Assets.SetPrice(0);
```

### CreateAsset <a name = "a-create"></a>

### UpdateAsset <a name = "a-update"></a>