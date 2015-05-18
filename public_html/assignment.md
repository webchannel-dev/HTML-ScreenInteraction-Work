# Worksample for Web developer

This worksample will go through 3 different steps.

1. The first step will measure your understanding for JavaScript and client heavy apps.

2. The second step will show how familiar you are with modeling data, and quering with SQL.

3. The third step will measure how familiar you are with HTML and CSS.

# Part 1, JavaScript

Attached is a JavaScript application which gets data from the
[mashup api](https://www.mashape.com/karlroos/systemet#!documentation), [systemetapi.se](http://systemetapi.se/).

The page search.html is tested on Chrome, Firefox, or Safari.

The main JavaScript file is `main.js`.

This is a part of the file `main.js` and it describes the Product class. Please see the full source code to
see the class in it's real context.

    /**
     * Product class.
     */
    function Product(opts){
      opts || (opts = {});
      for(var attr in opts){
        this[attr] = opts[attr];
      };
    }

    Product.prototype.getTagsString = function(){
      var tagsStr = "",
          separator = ", ";
      if(this.tags){
        for(var i in this.tags){
          tagsStr += separator + this.tags[i].name;
        }
        return tagsStr.substr(separator.length);
      }
      return tagsStr;
    }

    Product.prototype.getAlcoholPercentage = function(){
      var alcohol = 0;
      if(this.alcohol)
        alcohol = this.alcohol;
      return alcohol*100;
    }

    /**
     * Static access to find
     *
     * @param filter {Object} - the tags to filter on
     * @param callback {Function} - the callback function
     */
    Product.find = function(filter, callback){
      productService.find(
        filter,
        function deserialize(data){
          var products = [];
          for(var i in data){
            var item = data[i];
            products.push(new Product(item));
          }
          callback(products);
        });
    };

## Questions

### 1. Basic JavaScript

#### 1.1 Fix error

  * Try to search for some drink on search.html
  * As you see the search field parameter is not used
  * Solve it

#### 1.2 Fix another problem

  * Open the page search.html.
  * Select a tag for cider
  * Enter the term "Rekorderlig" in the search box
  * Press search

In the rendering of data the Alcohol percentage should show.  There should be a cider called Rekorderlig Skogsbär
in the table and it shows similar to this:

    | Name                  | Type         | Volume/Alcohol    | Price |
    |-----------------------|--------------|-------------------|-------|
    | Rekorderlig Skogsbär | cider, sweet | 7.000000000000001 | 17.9  |

The API returns 0.07.

1) Why does the page print 7.000000000000001?
2) Correct this bug so that the volume/alcohol percentage is show with one decimal.

### 2. Refactoring

1. What do you think of the product class? Please refactor the class as you would like to see it and focus on the flow for getting products from the mashup API.

   You do not need to validate arguments into functions.

# Part 2, SQL

We want to develop a Twitter-clone website.

There will be users, who can tweet, follow each other and be followed by others.

You want users to have just basic info like name, email, registration date and profile image.

## Questions

1. Write a table model describing this. Document it in any way that you want.

2. In a SQL write the query to:

  1. Get a list of all your tweets that you posted in november.
  2. Get a list of all your followers?
  3. How do you follow Screen Interaction user?
  4. Get the posts created by your most active followers? An active follower is a user that has
     posted more then 5 posts in the last 30 days.

# Part 3, HTML and CSS

You have to implement a responsive website based on following "Work Sample - Web Developer - Template.psd" file.
All image resources, you may need, can be extracted from this graphic file.

Website should use HTML5, CSS3/SASS/LESS. Other technology choices is important to our evaluation
of the task too. Your implementation should support all modern browsers.