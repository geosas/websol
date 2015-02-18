ADDON originally created by @hsquividant.

PHP query on french soil databases. Return edges and detail of soil cartographic unit selected by user.

Default options for this addon are specified in the manifest.json file:

    "default_options": {
        "WEBSOL_SERVERS": [
            {"name": "Bretagne", "url": "http://websoltest.agrocampus-ouest.fr/webservice/getUCS", "layers":"25035,25022,25029,25056"},
            {"name": "Bourgogne", "url": "http://bourgogne.websol.fr/webservice/getUCS", "layers": "25021,25058,25071,25089"},
            {"name": "Rhone-Alpes", "url": "http://rhone-alpes.websol.fr/webservice/getUCS", "layers": "69250,42250,26250,7250"},
            {"name": "Alsace", "url": "http://alsace.websol.fr/webservice/getUCS", "layers": "31372,30146"}
        ],
        "group": "Pedologie",
        "format": "geojson",
        "sld": false
    }

If you want to change soil database list, you have to add or delete WEBSOL server parameters line.

For example, to query only Bourgogne soil database, edit GEOR_custom.js file and insert the following lines in the ADDON config object. Be careful with comma ! 

    "options": {
        "WEBSOL_SERVERS": [
            {"name": "Bourgogne", "url": "http://websol.educagri.fr/webservice/getUCS", "layers": "25021,25058,25071,25089"}
        ],
        "group": "Pedologie",
        "format": "geojson",
        "sld": false
    }
