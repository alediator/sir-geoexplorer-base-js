/**
 * Copyright (C) 2013
 *
 * This file is part of the project ohiggins
 *
 * This software is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 2 of the License, or (at your option) any
 * later version.
 *
 * This software is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this library; if not, write to the Free Software Foundation, Inc., 51
 * Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA
 *
 * As a special exception, if you link this library with other files to produce
 * an executable, this library does not by itself cause the resulting executable
 * to be covered by the GNU General Public License. This exception does not
 * however invalidate any other reasons why the executable file might be covered
 * by the GNU General Public License.
 *
 * Author: Alejandro Diaz <adiaz@emergya.com>
 */

/**
 * @requires plugins/Tool.js
 * @requires downloadify/DownloadifyExporter.js
 */

/** api: (define)
 *  module = Viewer.plugins
 *  class = LayerExporter
 */

/**
 * api: (extends) plugins/Tool.js
 */
Ext.namespace('Viewer.plugins');

/**
 * api: constructor .. class:: ExportToKML(config)
 *
 * Plugin for exporting a selected layer to a file. 
 */
Viewer.plugins.LayerExporter = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = vw_exporter */
    ptype: 'vw_exporter',
    exportToKMLText: 'Export',
    exportToKMLTooltipText: 'Export a layer to a file',
    exportToKMLMsg: 'Generating Layer File ...',
    exportToKMLErrorTitle: 'Error',
    exportToKMLErrorContent: 'Error to export the layer',

    /**
     * Property: layer
     * 
     * {OpenLayers.Layer.Vector} to be exported
     */
    layer : null,

    /**
     * Property: exportWindows
     * 
     * {Map} with export windows by layerId | layerName
     */
    exportWindows: {},

    /** api:method[addOutput]
     *  Show download window
     */
    addOutput: function() {

        this.layer = this.selectedLayer;
        var mark = this.getLayerIdentifier() + this.ptype;

        var windowSelecter = this.exportWindows[mark];
        
        if(!windowSelecter){

            this.downloadifier = new Viewer.plugins.DownloadifyExporter();
            this.downloadifier.verbose = false;
            this.downloadFile();
            
            var embeddedDownloadify = this.downloadifier.getEmbeddedDownloadify("exportButton_" + mark);
            
            var formPanel = new Ext.form.FormPanel({ 
                items: [embeddedDownloadify]});        

            
            windowSelecter = new Ext.Window({
                title: String.format(this.downloadifier.windowSelecterTitle, this.layer.name, this.exportType), 
                closeAction: 'hide',
                items: [formPanel]});

            this.exportWindows[mark] = windowSelecter;
        }
            
        windowSelecter.show();
    },

    /** api:method[getLayerIdentifier]
     *  Obtain selected layer idientifier to improve number of export requests (only download a file one time)
     */
    getLayerIdentifier: function(){
        return this.layer.layerId ? this.layer.layerId : this.layer.name;
    },


    /** api:method[getLayerIdentifier]
     *  Obtain selected layer idientifier to improve number of export requests (only download a file one time).
     *  Overwrite this method to export to another format
     */
    generateRequestParameters: function(){
        var urlToExport = null;
        var paramsToExport = null;
        var urlLocalGeoServer = app.sources.local.url.replace('/ows', '');
        if (this.selectedLayer && this.selectedLayer.url) {
            if (this.selectedLayer.url.indexOf(urlLocalGeoServer) != -1) {
                urlToExport = urlLocalGeoServer;
            }
        }
        var contextLayer = null;
        if (this.selectedLayer.params && this.selectedLayer.params.LAYERS) {
            if (this.selectedLayer.params.LAYERS.indexOf(':') != -1) {
                contextLayer = this.selectedLayer.params.LAYERS.split(':')[0];
            }
        }
        if (contextLayer != null) {
            urlToExport += '/' + contextLayer + '/wms/kml';
        }

        this.fileName = this.selectedLayer.params.LAYERS + '.kml';

        paramsToExport = {
            'layers': this.selectedLayer.params.LAYERS,
            'DOWNLOAD': true,
            'FILENAME': this.fileName
        };

        return{
            url: urlToExport,
            params: paramsToExport
        }
    },

    /** api:method[downloadFile]
     *  :arg url: the url of the file to download.
     *  :arg params: optional params for the request.
     *   :arg sourceForm: optional form to use for uploadind data to the download controller.
     */
    downloadFile: function() {

        var requestParams = this.generateRequestParameters();
        var mark = this.getLayerIdentifier() + this.ptype;

        Ext.MessageBox.wait(this.exportToKMLMsg);

        Ext.Ajax.request({
            url: requestParams.url,
            params: requestParams.params,
            method: 'GET',
            disableCaching: false,
            success: function(o, r, n) {
                var downloadSuccessText = String.format(this.downloadifier.downloadSuccessText,this.nameTypeSelected, this.layer.name);
                this.downloadifier.getExportButton(this.fileName, o.responseText, "exportButton_" + mark, 
                    this.downloadifier.downloadSuccessTitleText, downloadSuccessText);
                Ext.MessageBox.updateProgress(1);
                Ext.MessageBox.hide();
            },
            failure: function(o, r, n) {
                Ext.MessageBox.updateProgress(1);
                Ext.MessageBox.hide();
                Ext.Msg.show({
                    title: this.exportToKMLErrorTitle,
                    msg: this.exportToKMLErrorContent,
                    buttons: Ext.Msg.OK
                });
            },
            scope: this
        });

    }

});

Ext.preg(Viewer.plugins.LayerExporter.prototype.ptype, Viewer.plugins.LayerExporter);
