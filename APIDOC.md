# *BF Guitar Shop* API Documentation
*This is a guitar e-commerce shop that sells guitars and accessories.*

## *Single Product Information*
**Request Format:** `/guitar/product/:productid`

**Request Type:** `GET`

**Required Parameters**
* `productid` (must be a positive integer)

**Returned Data Format**: `JSON`

**Description:** *Returns the name, category, price, and image link etc. of a single product given the product ID*

**Example Request:** `/guitar/product/7`

**Example Response:**

```
{
  {
    "product_id": 7,
    "name": "Handsome Acoustic Guitar",
    "category": "acoustic-guitar",
    "price": 300,
    "color": "Black",
    "img": "img/acoustic-black.png",
    "description": "Maple wood neck and body\nProduce stable and clear sound\nSuit for beginner and intermediate guitar learners"
  }
}
```

**Error Handling:**
* Responds with a `400` status plain text message if the the product ID parameter is not a positive integer or no items are found with this product id.
* Responds with a `500` status plain text message if the server encounters an error while connecting to the database.

## *List of items*
**Request Format:** `/guitar/:category`

**Request Type:** `GET`

**Required Parameters**
* `category` (`all`, `acoustic-guitar`, `electric-guitar` or `accessory`)

**Returned Data Format**: `JSON`

**Description:** *Returns the name, category, price, and image link etc. of all products given the category*

**Example Request:** `/guitar/acoustic-guitar`

**Example Response:**

```
{
  {
    "product_id": 7,
    "name": "Handsome Acoustic Guitar",
    "category": "acoustic-guitar",
    "price": 300,
    "color": "Black",
    "img": "img/acoustic-black.png",
    "description": "Maple wood neck and body\nProduce stable and clear sound\nSuit for beginner and intermediate guitar learners"
  },
  {
    "product_id": 8,
    "name": "Handsome Acoustic Guitar",
    "category": "acoustic-guitar",
    "price": 300,
    "color": "Darkred",
    "img": "img/acoustic-darkred.png",
    "description": "Maple wood neck and body\nProduce stable and clear sound\nSuit for beginner and intermediate guitar learners"
  }
  ...
}
```

**Error Handling:**
* Responds with a `400` status plain text message if the provided category parameter is not valid.
* Responds with a `500` status plain text message if the server encounters an error while connecting to the database.

## *DIY orders from clients*
**Request Format:** `/guitar/diy`

**Request Type:** `POST`

**Required Parameters**
* `type` (`electric` or `acoustic`)
* `neck` (`mahogany`, `maple`, etc.)
* `body` (`mahogany`, `maple`, etc.)
* `color` (`red`, `black`, etc.)
* `engraving` (`1` or `0`)

**Optional Parameters**
* `engraving-text` (if `engraving` is `1`)

**Returned Data Format**: `Plain Text`

**Description:** *Store DIY guitar info including guitar type(electric or acoustic), guitar neck material, guitar body material, color, and engraving to the database*

**Example Request:** `/guitar/diy` *with*
`FormData` *params:*

```
{
  "type": "electric",
  "neck": "Maple",
  "body": "Mahogany",
  "color": "Original",
  "engraving": "1",
  (opt) "engraving-text": "I love my bf."
}
```

**Example Response:**
`"DIY request successful! We will make your DIY guitar soon!"`

**Error Handling:**
* Responds with a `400` status plain text message if one or more provided parameters are invalid or missing.
* Responds with a `500` status plain text message if the server encounters an error connecting to the database.

## *FAQs*
**Request Format:** `/guitar/faq`

**Request Type:** `GET`

**Returned Data Format**: `JSON`

**Description:** *Returns the list of FAQs*

**Example Request:** `/guitar/faq`

**Example Response:**

```
{
  {
    "q": "Where do you make the guitars?",
    "a": "We are an international company based in a handful of regions. Depending on your specific DIY requests we will manufacture the guitar in different regions."
  },
  {
    "q": "Can I return my DIY guitar?",
    "a": "NO!"
  }
  ...
}
```

**Error Handling:**
* Responds with a `500` status plain text message if the server encounters an error during file reading.

## *Feedbacks from clients*
**Request Format:** `/guitar/feedback`

**Request Type:** `POST`

**Required Parameters**
* `name`
* `feedback`

**Returned Data Format**: `Plain Text`

**Description:** *Store any customer's feedback in the feedbacks table in the database*

**Example Request:** `/guitar/feedback` *with*
`FormData` *params:*

```
{
  "name": "Very Nice Customer",
  "feedback": "Your guitars are great!!"
}
```

**Example Response:**
`"Thank you, we have received your feedback and will keep improving!"`

**Error Handling:**
* Responds with a `400` status plain text message if one or more provided parameters are missing.
* Responds with a `500` status plain text message if the server encounters an error connecting to the database.
