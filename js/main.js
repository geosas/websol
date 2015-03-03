/*
 * @include GEOR_util.js
 * @include GEOR_waiter.js
 * @include OpenLayers/Format/JSON.js
 * @include OpenLayers/Request.js
 * @include OpenLayers/Handler/Point.js
 * @include OpenLayers/Handler/Path.js
 *
 */
Ext.namespace("GEOR.Addons");

GEOR.Addons.Websol = Ext.extend(GEOR.Addons.Base, {

    /**
     * Property: map
     * {OpenLayers.Map} The map instance.
     */
    map: null,

    /**
     * Property: popup
     * {GeoExt.Popoup.} Display popup window.
     */
    popup: null,

    /**
     * Property: vectorLayer
     * {OpenLayers.Layer.Vector} The vector layer on which we display results
     */
    vectorLayer: null,

    /**
     * Property: config
     *{Object} Hash of options */	
    config: null,

    /**
     * Property: mask
     * {Ext.LoadMask} the catalogue's keywords panel mask
     */
    mask: null,

    /**
     * Property: cnt
     * {var} the number of responses
     */
    cnt: 0, 

    /**
     * Method: tr
     * Translation please !
     */
    tr: function (str) {
        return OpenLayers.i18n(str);
    },

    /**
     * Method: init
     *
     * Parameters:
     * record - {Ext.data.record} a record with the addon parameters
     */
    init: function (record) {
        var lang = OpenLayers.Lang.getCode() ;
        mask = new Ext.LoadMask (Ext.getBody(), {
            msg: tr("Loading...")
        }) ;
        map = this.map;
        config = this.options;
//        console.log ("Liste des serveurs WEBSOL utilises : ") ; // debug infos
        for (i=0 ; i < config.WEBSOL_SERVERS.length ; i++)	{
//            console.log ("name="+config.WEBSOL_SERVERS[i].name+" / url="+config.WEBSOL_SERVERS[i].url+" / layers="+config.WEBSOL_SERVERS[i].layers) ;
        } 
        this.defControlGetUCS();
        this.clickUCS = new OpenLayers.Control.Click();
        this.map.addControl(this.clickUCS);
        this.vectorLayer = this.createVectorLayer () ; 
        this.map.addLayer (this.vectorLayer) ;

        if (this.target) {
            // addon placed in toolbar
            this.components = this.target.insertButton(this.position, {
                xtype: 'button',
                enableToggle: true,
                toggleGroup: 'map',
                tooltip: this.getTooltip(record), 
                iconCls: 'websol-icon',
                listeners: {
                    "toggle": this.onCheckchange,
                    scope: this 
                },
                scope: this 
            });
            this.target.doLayout();
        } else {
            // addon placed in "tools menu"
            this.item = new Ext.menu.CheckItem({
                text: this.getText(record), 
                qtip: this.getQtip(record),
                iconCls: 'websol-icon',
                listeners: {
                    "checkchange": this.onCheckchange,
                    scope: this 
                },
                scope: this 
            });
        }
    },

    /**
     * Method: createVectorLayer
     *
     * Returns:
     * {OpenLayers.Layer.Vector}
     */
    createVectorLayer: function() {
        var defStyle = OpenLayers.Util.extend({},
            OpenLayers.Feature.Vector.style['default']);
        var selStyle = OpenLayers.Util.extend({},
            OpenLayers.Feature.Vector.style['select']);
        var styleMap = new OpenLayers.StyleMap({
            "default": new OpenLayers.Style(
                OpenLayers.Util.extend(defStyle, {
                    cursor: "pointer",
                    fillOpacity: 0.1,
                    strokeWidth: 3
                })
            ),
            "select": new OpenLayers.Style(
                OpenLayers.Util.extend(selStyle, {
                    cursor: "pointer",
                    strokeWidth: 3,
                    fillOpacity: 0.1,
                    graphicZIndex: 1000
                })
            )
        });
        return new OpenLayers.Layer.Vector("UCSLayer", {
            displayInLayerSwitcher: false,
            styleMap: styleMap,
            rendererOptions: {
                zIndexing: true
            }
        });
    },

    /**
     * Method: getUCS
     * execute getUCS request on Websol server.
     *
     */
    getUCS: function(pt) {
        this.cnt = 0 ;
        this.msg = tr ("websol.popup.body.NOK") ;
        GEOR.waiter.show();
        mask && mask.show () ;
        this.popup && this.popup.destroy();
        if (this.vectorLayer) {
            this.vectorLayer.destroyFeatures() ;
        }
        for (i=0 ; i < config.WEBSOL_SERVERS.length ; i++)	{
            var url = config.WEBSOL_SERVERS[i].url+"?lon="+pt.x+"&lat="+pt.y+"&format="+config.format+"&layers="+config.WEBSOL_SERVERS[i].layers+"&sld="+config.sld ;
            this.msg += "- " + config.WEBSOL_SERVERS[i].name + "<br>";
            Ext.Ajax.request({
                url: url,
                method: 'GET',
                success: function(response) {
                    if (response.responseText.indexOf("no_uc") == -1) {
                        this.cnt++ ;
                        if (this.cnt >= config.WEBSOL_SERVERS.length) { // Aucun serveur n'a retourne une unite cartographique
                            this.popup = new GeoExt.Popup({
                                map: this.map,
                                title: tr ("websol.popup.title.NOK"),
                                location: pt,
                                anchorPosition: "top-left",
                                collapsible: false,
                                closable: true,
                                unpinnable: false,
                                buttons: [{
                                    text: tr("OK"),
                                    handler: function() {
                                        this.popup.close();
                                    },
                                    scope: this
                                }],
                                html: this.msg,
                                scope: this
                            });
                            mask && mask.hide();
                            this.popup.show();
                        }
                    }else{
                        var json = Ext.util.JSON.decode(response.responseText) ;
                        var geojsonFormat = new OpenLayers.Format.GeoJSON();
                        var html = json.properties["html"];
                        this.vectorLayer.addFeatures(geojsonFormat.read(json));
                        this.popup = new GeoExt.Popup({
                            map: this.map,
                            title: tr ("websol.popup.title.OK")+json.id,
                            location: pt,
                            width: 600,
                            height: 400,
                            anchorPosition: "top-left",
                            autoScroll: true,
                            closeAction: "hide",
                             collapsible: false,
                            closable: true,
                            unpinnable: false,
                            buttons: [{
                                text: tr("OK"),
                                handler: function() {
                                    this.popup.close();
                                    this.vectorLayer.destroyFeatures() ;
                                },
                                scope: this
                            }],
                            listeners: {
                                "hide": function() {
                                    this.vectorLayer.destroyFeatures() ;
                                },
                                scope: this
                            },
                            html: html,
                            scope: this
                        });
                        mask && mask.hide();
                        this.popup.show();
                    }
                },
                scope: this
            });
        }
    },

    /**
     * Method: defControlGetUCS
     * define Control 
     *
     */
    defControlGetUCS: function () {
        addon = this ;
        OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
            defaultHandlerOptions: {
                'single': true,
                'double': false,
                'pixelTolerance': 0,
                'stopSingle': false,
                'stopDouble': false
            },
            initialize: function () {
                this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
                OpenLayers.Control.prototype.initialize.apply(this, arguments);
                this.handler = new OpenLayers.Handler.Point(
                this, {
                    'done': this.trigger,
                }, 
                this.handlerOptions
                );
            },
            trigger: function (pt) {
                addon.getUCS(pt);
            },
            scope: this
        });
    },

    /**             
     * Method: onCheckchange 
     * Callback on checkbox state changed
     */     
    onCheckchange: function(item, checked) {
        if (checked) {
            GEOR.helper.msg("WebSol",
                OpenLayers.i18n("websol.helper.msg")) ;
            this.clickUCS.activate();
        } else {
            this.clickUCS.deactivate();
            if (this.vectorLayer) {
                this.vectorLayer.destroyFeatures() ;
            }
            if (this.popup) {
                this.popup.hide();
            }
        }
    },

    destroy: function() {        
       this.clickUCS.deactivate();
       this.clickUCS.destroy();
       this.popup.hide();
       this.popup = null;
       this.map.removeLayer (this.vectorLayer) ;
       this.vectorLayer = null;
       this.map = null;
       GEOR.Addons.Base.prototype.destroy.call(this);
    }
});
