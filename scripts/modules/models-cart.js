define(['underscore', 'modules/backbone-mozu', 'hyprlive', "modules/api"], function (_, Backbone, Hypr, api) {

    var CartItemProduct = Backbone.MozuModel.extend({
        helpers: ['mainImage'],
        mainImage: function() {
            var imgs = this.get("productImages"),
                img = imgs && imgs[0],
                imgurl = 'http://placehold.it/160&text=' + Hypr.getLabel('noImages');
            return img || { ImageUrl: imgurl, imageUrl: imgurl }; // to support case insensitivity
        },
        initialize: function() {
            var url = "/product/" + this.get("productCode");
            this.set({ Url: url, url: url });
        }
    }),

    CartItem = Backbone.MozuModel.extend({
        relations: {
            product: CartItemProduct
        },
        validation: {
            quantity: {
                min: 1
            }
        },
        dataTypes: {
            quantity: Backbone.MozuModel.DataTypes.Int
        },
        mozuType: 'cartitem',
        handlesMessages: true,
        helpers: ['priceIsModified'],
        priceIsModified: function() {
            var price = this.get('unitPrice');
            return price.baseAmount != price.discountedAmount;
        },
        saveQuantity: function() {
            if (this.hasChanged("quantity")) this.apiUpdateQuantity(this.get("quantity"));
        }
    }),

    Cart = Backbone.MozuModel.extend({
        mozuType: 'cart',
        handlesMessages: true,
        helpers: ['isEmpty','count'],
        relations: {
            items: Backbone.Collection.extend({
                model: CartItem
            })
        },
        
        initialize: function() {
            this.get("items").on('sync remove', this.fetch, this)
                             .on('loadingchange', this.isLoading, this);
        },
        isEmpty: function() {
            return this.get("items").length < 1;
        },
        count: function() {
            return this.apiModel.count();
            //return this.get("Items").reduce(function(total, item) { return item.get('Quantity') + total; },0);
        },
        toOrder: function() {
            var me = this;
            me.apiCheckout().then(function(order) {
                me.trigger('ordercreated', order);
            });
        },
        removeItem: function (id) {
            return this.get('items').get(id).apiModel.del();
        },
        addCoupon: function () {
            var me = this;
            var code = this.get('couponCode');
            var orderDiscounts = me.get('orderDiscounts');
            if (orderDiscounts && _.findWhere(orderDiscounts, { couponCode: code })) {
                // to maintain promise api
                var deferred = api.defer();
                deferred.reject();
                deferred.promise.otherwise(function () {
                    me.trigger('error', {
                        message: Hypr.getLabel('promoCodeAlreadyUsed', code)
                    });
                });
                return deferred.promise;
            }
            this.isLoading(true);
            return this.apiAddCoupon(this.get('couponCode')).then(function () {
                me.set('couponCode', '');
                var productDiscounts = _.flatten(_.pluck(_.pluck(me.get('items').models, 'attributes'), 'productDiscounts'));
                var shippingDiscounts = _.flatten(_.pluck(_.pluck(me.get('items').models, 'attributes'), 'shippingDiscounts'));

                var allDiscounts = me.get('orderDiscounts').concat(productDiscounts).concat(shippingDiscounts);
                var allCodes = me.get('couponCodes') || [];
                var lowerCode = code.toLowerCase();

                var couponExists = _.find(allCodes, function(couponCode) {
                    return couponCode.toLowerCase() === lowerCode;
                });
                if (!couponExists) {
                    me.trigger('error', {
                        message: Hypr.getLabel('promoCodeError', code)
                    });
                }

                var couponIsNotApplied = (!allDiscounts || !_.find(allDiscounts, function(d) {
                    return d.couponCode.toLowerCase() === lowerCode;
                }));
                me.set('tentativeCoupon', couponExists && couponIsNotApplied ? code : undefined);

                me.isLoading(false);
            });
        }
    });

    return {
        CartItem: CartItem,
        Cart: Cart
    };
});