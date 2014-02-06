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

GEOR.Addons.Sol = function(map, options) {
    this.map = map;    
    this.options = options;    
    this.item = null;    
};
GEOR.Addons.Sol.prototype = (function() {

    /*
     * Private
     */

    /**
     * Property: map
     * {OpenLayers.Map} The map instance.
     */
    var map = null;

    /**
     * Property: vectorLayer
     * {OpenLayers.Layer.Vector} The vector layer on which we display results
     */
    var vectorLayer = null;

    /**
     * Property: config
     *{Object} Hash of options,. */	
    var config = null;

    /**
     * Method: tr
     * Translation please !
     */
    var tr = function (str) {
            return OpenLayers.i18n(str);
        };

    /**
     * Property: mask
     * {Ext.LoadMask} the catalogue's keywords panel mask
     */
    var mask = null;

    /**
     * Property: cnt
     * {Ext.LoadMask} the number of responses
     */
    var cnt = 0 ;

    /**
     * Method: createVectorLayer
     *
     * Returns:
     * {OpenLayers.Layer.Vector}
     */
    var createVectorLayer = function() {
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
    };

    /**
     * Method: getUCS
     * execute getUCS request on Websol server.
     *
     */
    var getUCS = function(pt) {
        this.cnt = 0 ;
        this.msg = "Le point sélectionné n'appartient à aucune des régions interrogeables :<br><b>" ;
        GEOR.waiter.show();
        mask && mask.show () ;
        for (i=0 ; i < config.WEBSOL_SERVERS.length ; i++)	{
            var url = config.WEBSOL_SERVERS[i].url+"?lon="+pt.x+"&lat="+pt.y+"&format="+config.format+"&layers="+config.WEBSOL_SERVERS[i].layers+"&sld="+config.sld ;
            this.msg += "- " + config.WEBSOL_SERVERS[i].name + "<br>";
            console.log ("url="+url) ;
            Ext.Ajax.request({
                url: url,
                method: 'GET',
                success: function(response) {
                    if (response.responseText.indexOf("no_uc") == -1) {
                        this.cnt++ ;
                        if (this.cnt >= config.WEBSOL_SERVERS.length) { // Aucun serveur n'a retourne une unite cartographique
                            console.log ("Aucune donnee sur le point selectionne") ;
                            var win = new Ext.Window({
                                title: 'Shoot Again!',
                                autoScroll: true,
                                initCenter : true,
                                preventBodyReset: true,
                                buttons: [{
                                    text: tr("OK"),
                                    handler: function() {
                                        win.close();
                                    }
                                }],
                                html: this.msg
                            });
                            mask && mask.hide();
                            win.show();
                        }
                    }else{
                        var json = Ext.util.JSON.decode(response.responseText) ;
                        var geojsonFormat = new OpenLayers.Format.GeoJSON();
                        console.log (json.type+" "+json.id) ;
                        var html = json.properties["html"];
                        if (!vectorLayer) {
                            vectorLayer = createVectorLayer () ; 
                            map.addLayer(vectorLayer);
                        }else {
                            vectorLayer.destroyFeatures() ;
                        }
                        vectorLayer.addFeatures(geojsonFormat.read(json));
                        var win = new Ext.Window({
                            title: 'Unite Cartograpique de Sol n°'+json.id,
                            autoScroll: true,
                            initCenter : false,
                            x : 50,
                            y : 50,
                            width: 600,
                            height: 400,
                            preventBodyReset: true,
                            buttons: [{
                                text: tr("OK"),
                                handler: function() {
                                    win.close();
                                }
                            }],
                            html: html
                        });
                        mask && mask.hide();
                        win.show();
                    }
                }
            });
        }
        this.msg+="</b>" ;
    };

    /**
     * Method: defControlGetUCS
     * define Control 
     *
     */
    var defControlGetUCS = function () {
            OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
                displayClass: 'detailUCS',
                defaultHandlerOptions: {
                    'single': true,
                    'double': false,
                    'pixelTolerance': 0,
                    'stopSingle': false,
                    'stopDouble': false
                },
                initialize: function () {
                    this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
                    OpenLayers.Control.prototype.initialize.apply(
                    this, arguments);
                    this.handler = new OpenLayers.Handler.Point(
                    this, {
                        'done': this.clickUCS
                    });
                },
                clickUCS: function (pt) {
                    clickUCS.deactivate();
                    getUCS(pt);
                }
            });
        };

    return {
        /*
         * Public
         */


        /**
         * APIMethod: create
         *
         * APIMethod: create
         * Return a  {Ext.menu.Item} for GEOR_addonsmenu.js and initialize this module.
         *
         * Parameters:
         * addonConfig - Array of addon config objects
         */

         init: function (addonconfig) {
            var lang = OpenLayers.Lang.getCode() ;
            mask = new Ext.LoadMask (Ext.getBody(), {
                msg: tr("Loading...")
            }) ;
            map = this.map;
            config = this.options;
            console.log ("Liste des serveurs WEBSOL utilises : ") ; // debug infos
            for (i=0 ; i < config.WEBSOL_SERVERS.length ; i++)	{
                 console.log ("name="+config.WEBSOL_SERVERS[i].name+" / url="+config.WEBSOL_SERVERS[i].url+" / layers="+config.WEBSOL_SERVERS[i].layers) ;
            } //
            defControlGetUCS();
            clickUCS = new OpenLayers.Control.Click();
            map.addControl(clickUCS);
            drawLayer = new OpenLayers.Layer.Vector("Exutoire", {
                displayInLayerSwitcher: false
            });
            map.addLayer (drawLayer) ;

            var menuitems = new Ext.menu.Item({
                text: addonconfig.get("title")[lang],
                qtip: addonconfig.get("description")[lang],
                iconCls: 'getUCS-icon',
                listeners:{afterrender: function( thisMenuItem ) {
                    Ext.QuickTips.register({
                        target: thisMenuItem.getEl().getAttribute("id"),
                        title: thisMenuItem.initialConfig.text
                    });
                }},
                menu: new Ext.menu.Menu({
                    items: [
                    new Ext.menu.CheckItem (new Ext.Action ({
                        iconCls: 'drawpoint',
                        text: tr("sol.getucsfromclick"),
                        map: map,
                        toggleGroup: "map",
                        enableToggle: true,
                        allowDepress: true,
                        handler: function () {
                            clickUCS.activate();
                        }
                    }))]
                })
            });
            this.item = menuitems;
            return menuitems;
        },
        destroy: function() {        
            this.map = null;
        }
    }
})();
