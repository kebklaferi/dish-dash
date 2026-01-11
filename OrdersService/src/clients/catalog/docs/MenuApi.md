# MenuApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiCatalogBulkPost**](#apicatalogbulkpost) | **POST** /api/catalog/bulk | |
|[**apiCatalogDelete**](#apicatalogdelete) | **DELETE** /api/catalog | |
|[**apiCatalogGet**](#apicatalogget) | **GET** /api/catalog | |
|[**apiCatalogItemIdAvailabilityPut**](#apicatalogitemidavailabilityput) | **PUT** /api/catalog/{itemId}/availability | |
|[**apiCatalogItemIdDelete**](#apicatalogitemiddelete) | **DELETE** /api/catalog/{itemId} | |
|[**apiCatalogItemIdGet**](#apicatalogitemidget) | **GET** /api/catalog/{itemId} | |
|[**apiCatalogItemIdPut**](#apicatalogitemidput) | **PUT** /api/catalog/{itemId} | |
|[**apiCatalogPost**](#apicatalogpost) | **POST** /api/catalog | |

# **apiCatalogBulkPost**
> Array<MenuItems> apiCatalogBulkPost()


### Example

```typescript
import {
    MenuApi,
    Configuration
} from 'catalog-client';

const configuration = new Configuration();
const apiInstance = new MenuApi(configuration);

let restaurantId: number; // (optional) (default to undefined)
let menuItems: Array<MenuItems>; // (optional)

const { status, data } = await apiInstance.apiCatalogBulkPost(
    restaurantId,
    menuItems
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **menuItems** | **Array<MenuItems>**|  | |
| **restaurantId** | [**number**] |  | (optional) defaults to undefined|


### Return type

**Array<MenuItems>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/*+json
 - **Accept**: text/plain, application/json, text/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiCatalogDelete**
> apiCatalogDelete()


### Example

```typescript
import {
    MenuApi,
    Configuration
} from 'catalog-client';

const configuration = new Configuration();
const apiInstance = new MenuApi(configuration);

let restaurantId: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.apiCatalogDelete(
    restaurantId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **restaurantId** | [**number**] |  | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiCatalogGet**
> Array<MenuItems> apiCatalogGet()


### Example

```typescript
import {
    MenuApi,
    Configuration
} from 'catalog-client';

const configuration = new Configuration();
const apiInstance = new MenuApi(configuration);

let restaurantId: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.apiCatalogGet(
    restaurantId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **restaurantId** | [**number**] |  | (optional) defaults to undefined|


### Return type

**Array<MenuItems>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/plain, application/json, text/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiCatalogItemIdAvailabilityPut**
> apiCatalogItemIdAvailabilityPut()


### Example

```typescript
import {
    MenuApi,
    Configuration
} from 'catalog-client';

const configuration = new Configuration();
const apiInstance = new MenuApi(configuration);

let itemId: number; // (default to undefined)
let restaurant: number; // (optional) (default to undefined)
let body: boolean; // (optional)

const { status, data } = await apiInstance.apiCatalogItemIdAvailabilityPut(
    itemId,
    restaurant,
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **boolean**|  | |
| **itemId** | [**number**] |  | defaults to undefined|
| **restaurant** | [**number**] |  | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/*+json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiCatalogItemIdDelete**
> apiCatalogItemIdDelete()


### Example

```typescript
import {
    MenuApi,
    Configuration
} from 'catalog-client';

const configuration = new Configuration();
const apiInstance = new MenuApi(configuration);

let itemId: number; // (default to undefined)
let restaurant: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.apiCatalogItemIdDelete(
    itemId,
    restaurant
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **itemId** | [**number**] |  | defaults to undefined|
| **restaurant** | [**number**] |  | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiCatalogItemIdGet**
> MenuItems apiCatalogItemIdGet()


### Example

```typescript
import {
    MenuApi,
    Configuration
} from 'catalog-client';

const configuration = new Configuration();
const apiInstance = new MenuApi(configuration);

let itemId: number; // (default to undefined)
let restaurant: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.apiCatalogItemIdGet(
    itemId,
    restaurant
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **itemId** | [**number**] |  | defaults to undefined|
| **restaurant** | [**number**] |  | (optional) defaults to undefined|


### Return type

**MenuItems**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/plain, application/json, text/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiCatalogItemIdPut**
> apiCatalogItemIdPut()


### Example

```typescript
import {
    MenuApi,
    Configuration,
    MenuItems
} from 'catalog-client';

const configuration = new Configuration();
const apiInstance = new MenuApi(configuration);

let itemId: number; // (default to undefined)
let restaurant: number; // (optional) (default to undefined)
let menuItems: MenuItems; // (optional)

const { status, data } = await apiInstance.apiCatalogItemIdPut(
    itemId,
    restaurant,
    menuItems
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **menuItems** | **MenuItems**|  | |
| **itemId** | [**number**] |  | defaults to undefined|
| **restaurant** | [**number**] |  | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/*+json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiCatalogPost**
> MenuItems apiCatalogPost()


### Example

```typescript
import {
    MenuApi,
    Configuration,
    MenuItems
} from 'catalog-client';

const configuration = new Configuration();
const apiInstance = new MenuApi(configuration);

let restaurant: number; // (optional) (default to undefined)
let menuItems: MenuItems; // (optional)

const { status, data } = await apiInstance.apiCatalogPost(
    restaurant,
    menuItems
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **menuItems** | **MenuItems**|  | |
| **restaurant** | [**number**] |  | (optional) defaults to undefined|


### Return type

**MenuItems**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/*+json
 - **Accept**: text/plain, application/json, text/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

