WEBSOL ADDON
============ 

This addon allows users to query several regional WEBSOL servers in one click.

author:@hsquividant.

Compatibility: geOrchestra >= 14.12

Example addon config to include in your GEOR_custom.js file:

    {
        "id": "websol", // unique & stable string identifier for this addon instance
        "name": "Websol",
        "title": {
            "en": "WebSol",
            "es": "WebSol",
            "fr": "WebSol"
        },
        "description": {
            "en": "A tool which allow to query Soil database",
            "es": "Un outil qui permet d'interroger les unités cartographiques de sol provenant des référentiels régionaux pedologiques",
            "fr": "Un outil qui permet d'interroger les unités cartographiques de sol provenant des référentiels régionaux pedologiques"
        },
        "preloaded": "true",
        "options": {
            "target": "tbar_11", // Websol button in toolbar.
            "WEBSOL_SERVERS": [
                {"name": "Bretagne", "url": "http://websoltest.agrocampus-ouest.fr/webservice/getUCS", "layers":"25035,25022,25029,25056"},
                {"name": "Bourgogne", "url": "http://bourgogne.websol.fr/webservice/getUCS", "layers": "25021,25058,25071,25089"},
                {"name": "Rhone-Alpes", "url": "http://rhone-alpes.websol.fr/webservice/getUCS", "layers": "69250,42250,26250,7250"},
                {"name": "Alsace", "url": "http://alsace.websol.fr/webservice/getUCS", "layers": "31372,30146"}
            ]
        }
    }


another example of addon config to query only Alsace soil database :

    {
        "id": "websol", // unique & stable string identifier for this addon instance
        "name": "Websol",
        "title": {
            "en": "WebSol",
            "es": "WebSol",
            "fr": "WebSol"
        },
        "description": {
            "en": "A tool which allow to query Soil database",
            "es": "Un outil qui permet d'interroger les unités cartographiques de sol provenant des référentiels régionaux pedologiques",
            "fr": "Un outil qui permet d'interroger les unités cartographiques de sol provenant des référentiels régionaux pedologiques"
        },
        "options": {
            "WEBSOL_SERVERS": [
                {"name": "Alsace", "url": "http://alsace.websol.fr/webservice/getUCS", "layers": "31372,30146"}
            ]
        }
    }

