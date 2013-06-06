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
 * Author:Alejandro Diaz Torres <adiaz@emergya.com>
 */

/**
 * @requires downloadify/js/swfobject.js
 * @requires downloadify/js/downloadify.min.js
 */

/** api: (define)
 *  module = Viewer.plugins
 *  class = DownloadifyExporter
 */

/**
 * api: (extends) plugins/Tool.js
 */
Ext.namespace('Viewer.plugins');

/**
 * api: constructor .. class:: DownloadifyExporter(config)
 *
 * Downladifier to generate files in client side
 */
Viewer.plugins.DownloadifyExporter = Ext.extend(Ext.Component, {

    /** api: ptype = vw_downloadifier */
    ptype: 'vw_downloadifier',

    /** i18n */
    downloadFileText : "{0}_{1}.{2}",
    downloadFileExtension: "xml",
    downloadImage : "/theme/ux/downloadify/download.png",
    swf: '/theme/ux/downloadify/downloadify.swf',
    downloadErrorTitleText : "Download Error",
    layerEmptyText : "You can't export an empty layer",
    downloadErrorText : "You must put something in the File Contents or there will be nothing to save!",
    downloadCancelTitleText : "Down canceled",
    downloadCancelText : "You have cancelled the saving of this file.",
    downloadSuccessTitleText : "Done",
    downloadSuccessText : "The layer '{1}' file has been saved formatted as '{0}'",
    selectTypeText: "Select layer to export",
    helpText: "<ul><li>Select the file type to export the layer</li><li>If you have selected any feature at map the exporter only export these</li><ul>",
    exportingText: "Exporting the layer...",
    labelComboText: "Type",
    windowSelecterTitle: "Layer export of {0}",
    exportText: "Export",
    downloadFileText: "{0}_{1}.{2}",

    /** Downloadify parameters **/
    verbose: true,
    dataType: 'string', //'base64'

    /**
     * Property: layer
     * 
     * {OpenLayers.Layer.Vector} to be exported
     */
    layer : null,

    /**
     * Method: getExportButton
     * 
     * Init the export button
     * 
     * See also: - <a
     * href="http://github.com/dcneiner/Downloadify">Downloadify</a>
     * 
     */
    getExportButton : function(fileName, data, idButton,
            downloadSuccessTitleText, downloadSuccessText,
            downloadCancelTitleText, downloadCancelText,
            downloadErrorTitleText, downloadErrorText,
            helpText, statusBar) {
        while(fileName.indexOf(":")>-1){
            fileName = fileName.replace(":", "_");
        } 
        if (this.verbose)
            console.log("Downloading '" + fileName + "'");

        var downloadSuccessTitleText = downloadSuccessTitleText ? downloadSuccessTitleText: this.downloadSuccessTitleText;
        var downloadSuccessText = downloadSuccessText ? downloadSuccessText : this.downloadSuccessText;
        var downloadCancelTitleText = downloadCancelTitleText ? downloadCancelTitleText : this.downloadCancelTitleText;
        var downloadCancelText = downloadCancelText ?  downloadCancelText: this.downloadCancelText;
        var downloadErrorTitleText = downloadErrorTitleText ?  downloadErrorTitleText: this.downloadErrorTitleText;
        var downloadErrorText = downloadErrorText ? downloadErrorText : this.downloadErrorText;
        var helpText = helpText ? helpText : this.helpText;
        var statusBar = statusBar ? statusBar : this.statusBar;

        // url image and flash
        var swf = this.getRootAppFile(this.swf);
        var downloadImage = this.getRootAppFile(this.downloadImage);

        var self = this;
        Downloadify.create(idButton,{
            filename: function(){
              return fileName;
            },
            data: function(){ 
              return data;
            },
            onComplete: function(){
                self.onCompleteRequest(statusBar, helpText, downloadSuccessTitleText, downloadSuccessTitleText);
            },
            onCancel: function(){ 
                Ext.Msg.alert(downloadCancelTitleText, downloadCancelText);
            },
            onError: function(){ 
                Ext.Msg.alert(downloadErrorTitleText, downloadErrorText); 
            },
            transparent: false,
            swf: swf,
            downloadImage: downloadImage,
            dataType:this.dataType,
            width: 100,
            height: 30,
            append: false
          });
    },

    /**
     * Method: getRootAppFile
     * 
     * Obtain app root url for an url if app is in production mode 
     * (exist 'moduloCartografico' in document.URL) or jetty root url for debug
     * 
     * Parameters url - <String> to parsed
     */
    getRootAppFile: function(url){
        if(document.URL.indexOf("/moduloCartografico/composer/")  != -1){
            return document.URL.replace("/moduloCartografico/composer/", "/moduloCartografico/" + url);
        }else{
            return url;
        }
    },

    /**
     * Method: setLayerToExport
     * 
     * Setter for layer to be exported
     * 
     * Parameters layer - <OpenLayers.Layer.Vector> to be
     * exported
     */
    setLayerToExport : function(layer) {
        this.layer = layer;
    },

    /**
     * Method: getembeddedDownloadify
     * 
     * Get default downloadify container with an id
     * 
     * Parameters idContainer - <String> id for the container
     */
    getEmbeddedDownloadify : function(idContainer) {
        return new Ext.Container({
            autoEl : 'p',
            id : idContainer,
            cls : "downloadify"
        });
    },
    
    onCompleteRequest: function(statusBar, helpText, downloadSuccessTitleText, downloadSuccessTitleText){
        statusBar.setText(helpText);
        Ext.Msg.alert(downloadSuccessTitleText, downloadSuccessText);
    }

});

Ext.preg(Viewer.plugins.DownloadifyExporter.prototype.ptype, Viewer.plugins.DownloadifyExporter);
