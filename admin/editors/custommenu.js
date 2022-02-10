Ext.widget({
    xtype: 'mz-form-widget',
    itemId: 'menu',
    id: 'menu',
    defaults: {
            xtype: 'textfield',
            listeners: {
                controller: '',
            }
        },
    
    items: [
            
            {
                    xtype: 'textfield',
                    width: 200,
                    allowBlank: true,
                    fieldLabel: 'Menu Item',
                    id : 'labeltxt',
                    name: 'labelText'
            },
            {
                    xtype: 'textfield',
                    width: 200,
                    allowBlank: true,
                    fieldLabel: 'Menu Item Link',
                    id : 'labellnk',
                    name: 'labelLink'
            },
            {
                    xtype: 'button',
                    text : 'Add',
                    allowBlank: false,
                    name: 'addbtn',
                    handler : function(cmp){
                        var rootData = Ext.getCmp('menu');
                        rootData.getLinkData(Ext.getCmp('menu'));
                    }
                    
            },
            {
                xtype       : 'container',
                width       : '100%',
                height      : 300,
                autoScroll  : true,
                padding     : '20 0 20 0',
                itemId      : 'preview-container',
                style: {
                    background: "#EEE",
                    color: "#FFF",
                    "text-decoration": "none"
                },
                items: [
                    {
                        xtype: 'component',
                        itemId: 'preview',
                        autoEl: {
                                    html  : ''
                                }
                    }
                ]
            },
            {
                    xtype: 'taco-arrayField',
                    itemId : 'arraydata',
                    width: 200,
                    fieldLabel: 'Label Array',
                    name: 'data', 
                    hidden : true
            }
            
            
            ],
            getLinkData : function(cmp){
                var linkdetails = {};
                linkdetails.labeltxt = Ext.getCmp('labeltxt').getValue();
                linkdetails.labellnk = Ext.getCmp('labellnk').getValue();
                this.updateArrayData(linkdetails,cmp);
            },
            updateArrayData : function(lnkdetails,cmp){
                var tocoarrdata = Ext.getCmp('menu').down('#arraydata');
                gettacoarrdata = tocoarrdata.getValue();
                lnkdetails.lblId = gettacoarrdata.length+1; 
                console.log(lnkdetails);
                if(lnkdetails.labeltxt !== '' && lnkdetails.labellnk !== '' ){
                    
                    gettacoarrdata.push(lnkdetails);
                    tocoarrdata.setValue(gettacoarrdata);
                    Ext.getCmp('labeltxt').setValue('');
                    Ext.getCmp('labellnk').setValue('');
                } else {
                    Ext.Msg.alert('ERROR!!!', 'Please provide values.');
                }
                 this.updatePreview();
            },
            listeners: {
                afterrender: function (cmp) {
                    this.updatePreview();
                }
            },
            updatePreview: function () {
                var formValues = this.getForm().getValues();
                this.createLinkPreview(formValues.data);
            },
            createLinkPreview : function(tacodata){
                var meThis = this;
                var data;
                var preview = this.down('#preview');
                var el =  preview.getEl();
                if(el && el.dom){
                    el.dom.innerHTML = "";
                }
                var parentElem = document.createElement('div');
                var linktable = document.createElement('table');
                linktable.setAttribute('border','1');
                linktable.style.color = '#000';
                linktable.style.margin = '0px auto';
                linktable.style.width = '500px';
                
                var tableHeadingrow = document.createElement('tr');
                var tableHeading1 = document.createElement('th');
                var tableText1 = document.createTextNode('Text');
                var tableHeading2 = document.createElement('th');
                var tableText2 = document.createTextNode('Link');
                var tableHeading3 = document.createElement('th');
                tableHeading1.appendChild(tableText1);
                tableHeading2.appendChild(tableText2);
                tableHeadingrow.appendChild(tableHeading1);
                tableHeadingrow.appendChild(tableHeading2);
                tableHeadingrow.appendChild(tableHeading3);
                linktable.appendChild(tableHeadingrow);
                for(var i = 0; i < tacodata.length ; i++){
                    var linkdiv = document.createElement('tr');
                    linkdiv.setAttribute('border','1');
                    linkdiv.style.textAlign = 'center';
                    var linklabel = document.createElement('td');
                    linklabel.setAttribute('rowId',tacodata[i].lblId);
                    linklabel.onclick = function(e){
                        console.log(e);
                        console.log(e.target.getAttribute("rowId"),tacodata[(e.target.getAttribute("rowId"))-1].labeltxt);
                        meThis.editValue(e.target.getAttribute("rowId"),'linktext',tacodata[(e.target.getAttribute("rowId"))-1].labeltxt);
                    }
                    var linkText = document.createTextNode(tacodata[i].labeltxt);
                    
                    var linklabelA = document.createElement('td');
                    linklabelA.setAttribute('rowId',tacodata[i].lblId);
                    linklabelA.onclick = function(e){
                        console.log(e);
                        meThis.editValue(e.target.getAttribute("rowId"),'link',tacodata[(e.target.getAttribute("rowId"))-1].labellnk);
                    }
                    var linkTextA = document.createTextNode(tacodata[i].labellnk);
                    var linkbtncol = document.createElement('td');
                    var linkbnt = document.createElement('input');
                    linkbnt.setAttribute('type','button');
                    linkbnt.setAttribute('rowId',tacodata[i].lblId);
                    linkbnt.setAttribute('value','Remove');
                    linkbnt.style.background= "#CA1010";
                    linkbnt.style.border= "1px solid #EEE";
                    linkbnt.style.color= "#FFF";
                    linkbnt.style.padding= "5px 8px";
                    linkbnt.onclick = function(e){ 
                        meThis.editValue(e.target.getAttribute("rowId"));
                    };
                    linklabelA.appendChild(linkTextA); 
                    linklabel.appendChild(linkText);
                    linkbtncol.appendChild(linkbnt);
                    linkdiv.appendChild(linklabel);
                    linkdiv.appendChild(linklabelA);
                    linkdiv.appendChild(linkbtncol);
                    linktable.appendChild(linkdiv);
                    parentElem.appendChild(linktable);
                }
                if(el && el.dom)
                    el.dom.appendChild(parentElem);
                
                
                
            },
            editValue : function(id,name,value){
                var meThis = this;
                var currentValue = meThis.getCurrentItem(id);
                
                if(name){
                    if(name === 'linktext'){
                         Ext.Msg.prompt('menu Lable', 'Please enter a label text:', function(btn, text){
                        if (btn == 'ok'){
                            meThis.updateArrayDataWithNewValue(id,"labeltxt",text);
                        }
                    },this, false,currentValue?currentValue.name:'');
                    }
                    if(name === 'link'){
                         Ext.Msg.prompt('menu Link', 'Please enter a label link:', function(btn, text){
                        if (btn == 'ok'){
                            meThis.updateArrayDataWithNewValue(id,"labellnk",text);
                        }
                    },this, false,currentValue?currentValue.name:'');
                    }
                }else{
                    meThis.removemenu(id);
                }
            },
            getCurrentItem: function(id){
                console.log(id);
            var arrayData = Ext.getCmp('menu').down('#arraydata');
            if(arrayData.getValue().length > 0){
                var arr = arrayData.getValue();
                console.log(arr);
                for( var i = 0; i<arr.length;i++)
                    if(arr[i].lblId == id){
                        console.log(arr[i].lblId);
                        return arr[i];
                    }
                arrayData.setValue(arr);
            }
            return '';
        },
        updateArrayDataWithNewValue : function(id,name,newname){
            meThis = this;
            var arrayData = Ext.getCmp('menu').down('#arraydata');
            if(arrayData.getValue().length > 0){
                var arr = arrayData.getValue();
                if(name === "labeltxt"){
                    if(arr[id-1].lblId == id){
                            arr[id-1].labeltxt = newname;
                    } 
                    //arrayData.setValue(arr);
                }else if(name == "labellnk"){
                    if(arr[id-1].lblId == id){
                            arr[id-1].labellnk = newname;
                    }
                }
            }
            arrayData.setValue(arr);
            this.updatePreview();
            
            
        },
        removemenu : function(id){
            meThis = this;
            var arrayData = Ext.getCmp('menu').down('#arraydata');
            if(arrayData.getValue().length > 0){
                var arr = arrayData.getValue();
                arr.splice(id-1,1);
            }
            arrayData.setValue(arr);
            this.updatePreview();
        }
});
   





