define([
    "modules/jquery-mozu",
    "hyprlive",
    "modules/backbone-mozu"], function($, Hypr, Backbone) {

        var AlertView = Backbone.MozuView.extend({
            templateName: "modules/dsd-orderprocess/future-popup",
            additionalEvents: {
                "click .mz-alert-close img": 'closepopup',
                "click .mz-btn-accept":'proceed',
                "click .mz-btn-reject":'cancel'
            },
            closepopup: function(){ 
                this.model.set("subscriptionDialog", false);
                this.model.set("visible", false);
                $(document).find("body").find(".overlay-full-width").hide(); 
                this.render(); 
            },
            proceed:function(){
                this.call(true);
            },
            cancel:function(){
                this.model.set("subscriptionDialog", false);
                this.call(false);
            },
            call:null,
            fillmessage: function(dialogRef, message, callback){
                //$(document).find("[data-mz-alert]").removeClass();
                var count = 1;
                this.model.set("message", message);
                this.model.set("visible", true);
                if(dialogRef === "future-date") {
                    this.model.set("futuredatebtns", true);
                    this.model.set("futuredatesbtns", false);
                }else if(dialogRef === "future-dates") {
                    this.model.set("futuredatesbtns", true);
                    this.model.set("futuredatebtns", false);
                }
                var me = this;
                this.render();
                me.call = callback;
                 $(document).find("[data-mz-alert]").addClass(dialogRef);
                // if(count){
                //    
                //     $(document).on('click','.'+dialogRef+' .mz-btn-accept',function(){
                //         callback(true);
                        
                //     });
                //     $(document).on('click','.'+dialogRef+' .mz-btn-reject',function(){
                //         if($(this).hasClass("mz-btn-backtosub")) {
                //             me.model.set("subscriptionDialog", false);
                //         }
                //         callback(false); 
                //     });
                //     count--;
                // } 
            },
            render: function() {
                Backbone.MozuView.prototype.render.apply(this);
            }
        });
        
        var messageModel = Backbone.MozuModel.extend({});
        var messages = {};
        var alertView = new AlertView({
            el: $(".mz-alert-popup"),
            model: new messageModel(messages)
        });
        alertView.render();
        
        return{  
            AlertView: alertView
        };

    });


