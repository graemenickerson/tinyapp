# TinyApp Notes& Ideas

September 30, 2019


### what it does

takes in ulr as a String and creates a unique short url that is returned to the user.

there needs to be login functionality

class stored ulrs
  ->class user extends stored ulrs


### Logic / Generation

6 char num & lower/uppercase Letters

random number generator for each character converted to utf-8 stored in an array

use a ranodomizer to put the arrayed char into a string 

if string equals one that has been used before than remix the string.
if that is never unique create new array.

### Storage

everything is stored as an object formated as:

```js
storedULR = {
  fullrULR, // <input by user>,
  shortULR, // <generatedULR>
  // Stretch below
  dateCreated,
  timesFollowed,
  numOfUniqueUsers
};

```