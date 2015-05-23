

// Set up the application namespaces
var screeninteraction = {};
screeninteraction.services = {};
screeninteraction.models = {};


(function (ns) {
    "use strict;"
    function Service () {}
    // Some default values
    Service.prototype.datatype = "json";
    Service.prototype.data = {};
    Service.prototype.url = "https://karlroos-systemet.p.mashape.com/tag";
    Service.prototype.mashupHeader = "yl51IfHXDmGrvGC1am4IWeoX02oDGDQg";
    /**
     * Clears all null values from the data object.
     */
    Service.prototype.clearNullValues = function(dirty){
      var washed = {};
      for(var i in dirty){
        if(dirty[i] === null || dirty[i] === undefined){
          continue;
        }else{
          washed[i] = dirty[i];
        }
      }
      return washed;
    }

    Service.prototype.get = function(callback) {
      var self = this;
      $.ajax({
        url: self.url,
        data: self.data,
        datatype: self.datatype,
        success: function(data){
          callback(data);
        },
        beforeSend: function(xhr) {
          xhr.setRequestHeader("X-Mashape-Authorization", self.mashupHeader);
        }
      });
    };

    /**
     * Create a tag service
     */
    function TagService() {
      this.url = "https://karlroos-systemet.p.mashape.com/tag";
    };
    // Setup the inheritance
    TagService.prototype = new Service();
    TagService.prototype.parent = Service.prototype;
    TagService.prototype.constructor = TagService();

    /**
     * Gets all tags
     */
    TagService.prototype.findAll = function(callback) {
      this.parent.get.call(this, callback);
    };

    /*
     * The product service
     */
    function ProductService() {
      var self = this;
      self.url = "https://karlroos-systemet.p.mashape.com/product";
      self.datatype = "jsonp";
    }
    // Setup the inheritance
    ProductService.prototype = new Service();
    ProductService.prototype.parent = Service.prototype;
    ProductService.prototype.constructor = ProductService();

    /**
     * Find all products by the given tags
     */
    ProductService.prototype.find = function(filter, callback) {
      this.data = this.clearNullValues(filter || {});
      this.parent.get.call(this, callback)
    }

  ns.TagService = TagService;
  ns.ProductService = ProductService;
})(screeninteraction.services);

// Initiate service instances
var app = {};
app.services = {};
app.services.tagService = new screeninteraction.services.TagService();
app.services.productService = new screeninteraction.services.ProductService();

//
// Create the models
//
(function(tagService, productService, ns){
  "use strict;"
  function Tag(opts){
    opts || (opts = {});
    this.name = opts.name || "";
    this.id = opts.id || "";
    this.selected = !!opts.selected || false;
  }

  Tag.prototype.toggleSelected = function(){
    this.selected = !this.selected;
  }

  /**
   * Static access to findAll
   */
  Tag.findAll = function(callback){
    var serializer = new TagSerializer(callback);
    return tagService.findAll(serializer.deserialize);
  }

  /**
   *
   */
  function TagSerializer(callback){
    /**
     * Deserializes json data to tag objects
     */
    function deserialize(data){
      var tags = [];
      for(var i in data){
        var item = data[i];
        tags.push(new Tag(item));
      }
      callback(tags);
    };

    return {
      deserialize : deserialize
    };
  };

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
    return  parseFloat(alcohol*100).toFixed(1);
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

  // These are the objects that will be exposed
  ns.Tag = Tag;
  ns.Product = Product;

})(app.services.tagService, app.services.productService, screeninteraction.models);

// Init the helpers namespace
app.helpers = {};

(function(Tag, app){
  "use strict;"
  var self;

  function TagHelper(){
    self = this;
    this.listenersInitialized = false;
    this.tags = [];
    this.selectedTags = [];
  }

  TagHelper.prototype.setup = function(){
    Tag.findAll(this.renderAndCreateListeners);
  }

  TagHelper.prototype.renderAndCreateListeners = function(tags){
    self.renderTags(tags);
    self.setupListeners();
  }

  TagHelper.prototype.renderTags = function(tags){
    this.tags = tags;
    $('.single-tag').remove();
    $.each(tags, function(index, tag) {
      $('.sb-tags').append('<span data-tag-id="' + tag.id + '" class="btn btn-default single-tag">' + tag.name + '</span>');
    });
  };

  TagHelper.prototype.setupListeners = function(){
    if(!this.listenersInitialized){
      $(document).on('click', '.single-tag', this.onTagClicked);
    }
    this.listenersInitialized = true;
  }

  TagHelper.prototype.onTagClicked = function(newValue) {
    $(this).toggleClass('btn-default').toggleClass('btn-warning');
    self.toggleTagValue($(this).data('tag-id'));
  }

  TagHelper.prototype.toggleTagValue = function(tag){
    var found = $.inArray(tag, self.selectedTags);
    if (found >= 0) {
      self.selectedTags.splice(found, 1);
    } else {
      self.selectedTags.push(tag);
    }
  }

  TagHelper.prototype.getTags = function(){
    var str = "",
        spacer = ",";
    for(var i in this.selectedTags){
      var tag = this.selectedTags[i];
      str += spacer + tag;
    }
    if(str.length > 0){
      return str.substr(spacer.length);
    }
    return this.selectedTags;
  }

  app.tagHelper = new TagHelper();

})(screeninteraction.models.Tag, app.helpers);


(function(ns){
  "use strict;"
  var self;
  function PriceHelper(){
    self = this;
    this.priceFrom = 0;
    this.priceTo = 0;
    this.alcoholFrom = 0;
    this.alcoholTo = 0;
  };

  PriceHelper.prototype.setup = function(){
    this.setupSliders();
    this.initDefaultValues();
  };

  PriceHelper.prototype.initDefaultValues = function(){
    var self = this;
    $('.range-slider').each(function(){
      var $element = $(this),
          values = $element.val();
      self.onSlideMove($element, values);
    });
  }

  PriceHelper.prototype.onSlideMove = function($element, values){
    if (!$.isArray(values)) {
      values = Math.round(values);
    } else {
      values = self.roundArray(values);
    }
    if ($element.parent().hasClass('alcohol-range')) {
      $('.active-pic').removeClass('active-pic');
      $target = $('#alc-' + values);

      $target.addClass('active-pic');
      var alcValues = $target.data("alc");
      this.alcoholFrom = alcValues[0];
      this.alcoholTo   = alcValues[1];
    } else {
      $element.prev('.label-from').text(values[0] + $element.data('format'));
      $element.next('.label-to').text(values[1] + $element.data('format'));
      this.priceFrom = values[0];
      this.priceTo = values[1];
    }
  };

  PriceHelper.prototype.setupSliders = function(){
    self = this;
    //Init custom range slider
    $('.range-slider').each(function(i, obj) {
      var start = [$(this).data('from'), $(this).data('to')];
      var handles = 2;
      var connect = true;
      if ($(this).data('from') === 0) {
        start = 1;
        handles = 1;
        connect = false;
      }

      $(this).noUiSlider({
        range: [$(this).data('from'), $(this).data('to')],
        start: start,
        handles: handles,
        step: $(this).data('step'),
        connect: connect,
        slide: function(){
          var $element = $(this),
              values = $element.val();
          self.onSlideMove($element, values);
        }
      });
    });
  }

  PriceHelper.prototype.roundArray = function(args){
    var roundArgs = [];
    $.each(args, function(i, val){
      roundArgs.push(Math.round(val));
    });
    return roundArgs;
  }

  PriceHelper.prototype.getPriceFrom = function(){
    return this.nullOrValue(this.priceFrom);
  }

  PriceHelper.prototype.getPriceTo = function(){
    return this.nullOrValue(this.priceTo);
  }

  PriceHelper.prototype.getAlcoholFrom = function(){
    return this.nullOrValue(this.alcoholFrom);
  }

  PriceHelper.prototype.getAlcoholTo = function(){
    return this.nullOrValue(this.alcoholTo);
  }

  PriceHelper.prototype.nullOrValue = function(value){
    if(value === 0){
      return null;
    }
    return value;
  }

  ns.priceHelper = new PriceHelper();
})(app.helpers);

(function(Product, ns){
  "use strict;"
  var self;
  function ProductHelper(){
    self = this;
  }

  ProductHelper.prototype.setup = function(){

  }

  ProductHelper.prototype.search = function(filter, callback){
    self.callback = callback;
    Product.find(filter, this.render);
  }

  ProductHelper.prototype.render = function(data){
    for( var i in data){
      var item = data[i];
      $("#search-results tbody").append($("<tr>").append($("<td>").text(item.name)).append($("<td>").text(item.getTagsString())).append($("<td>").text(item.getAlcoholPercentage())).append($("<td>").text(item.price)));
    }
    self.callback();
  }

  ns.productHelper = new ProductHelper();
})(screeninteraction.models.Product, app.helpers);


(function(helpers, ns){
  "use strict;"
  var self;

  function Application(){
    self = this;
    this.limit = 20;
    this.offset = 0;
    this.productHelper = helpers.productHelper;
    this.tagHelper = helpers.tagHelper;
    this.priceHelper = helpers.priceHelper;
    this.setup();
  }

  Application.prototype.setup = function(){
    this.tagHelper.setup();
    this.priceHelper.setup();
    this.productHelper.setup();
    this.registerListeners();
  }

  Application.prototype.registerListeners = function(){
    $(document).on('click', '#search', this.onSearch);
    $(document).on('click', '#show-more', this.onShowMore);
    $(document).on("submit", "form.form-inline", this.onSearchEnter);
  }

  Application.prototype.onSearch = function(){
    self.clearSearch();
    self.search();
  }

  Application.prototype.search = function(){
    this.beforeSearch();
    this.productHelper.search(this.getProductionOptions(), this.afterSearch);
  }

  Application.prototype.getProductionOptions = function(){
    return {
      "offset" : this.offset,
      "limit"  : this.limit,
      "tag"    : this.tagHelper.getTags(),
      "price_from" : this.priceHelper.getPriceFrom(),
      "price_to" : this.priceHelper.getPriceTo(),
      "alcohol_from" : this.priceHelper.getAlcoholFrom(),
      "alcohol_to" : this.priceHelper.getAlcoholTo()
      // "name" : 'xxx'
    };
  };

  Application.prototype.onShowMore = function(){
    self.offset += self.limit;
    self.search();
  }

  Application.prototype.onSearchEnter = function(event){
    event.preventDefault();
    self.onSearch();
  }

  Application.prototype.beforeSearch = function(){
    $('.overlay').removeClass('hidden');
    $('#show-more').remove();
  }

  Application.prototype.clearSearch = function(){
    self.offset = 0;
    //Clear old results
    $('#search-results tbody').text('');
  }

  Application.prototype.afterSearch = function(){
    self.makeTableSortable();
    $('#search-results').after('<button type="button" id="show-more" class="col-md-12 btn btn-link">Show more</button>');
    $('.overlay').addClass('hidden');
  }

  Application.prototype.makeTableSortable = function(){
    //Make table sortable
    $('#search-results').stupidtable();
    $('#search-results').bind('aftertablesort', function (event, data) {
      var th = $(this).find("th");
      th.find(".arrow").remove();
      var arrow = data.direction === "asc" ? "↑" : "↓";
      th.eq(data.column).append('<span class="arrow">' + arrow +'</span>');
    });
  }

  ns.SystemetApi = Application;

})(app.helpers, app);

$(function(){
  // Start the application
  new app.SystemetApi();
});