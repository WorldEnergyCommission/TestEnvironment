(function (window) {

    // namespace
    var Page_Hardware_Mainboard = new (function () {

        this.Mainboard = function () {

            this.category = "Hardware";
            this.name = "Mainboard";
            this.subnavigationicon = "sec-nav-mainboard.png";

            var CycleTime = 2000;
            var base = undefined;

            // information
            var IDX_Mainboard_MainboardType = 0;
            var IDX_Mainboard_SerialNumber = 0;
            var IDX_Mainboard_ProductionDate = 0;
            var IDX_Mainboard_BootCount = 0;
            var IDX_Mainboard_OperatingTime = 0;
            var IDX_Mainboard_MinBoardTemperature = 0;
            var IDX_Mainboard_MaxBoardTemperature = 0;
            var IDX_Mainboard_MinInputVoltage = 0;
            var IDX_Mainboard_MaxInputVoltage = 0;
            var IDX_Mainboard_MainboardTemperature = 0;
            // version
            var IDX_Mainboard_MainboardRevision = 0;
            var IDX_Mainboard_BiosMajorVersion = 0;
            var IDX_Mainboard_BiosMinorVersion = 0;
            var IDX_Mainboard_BiosVersion = 0;
            // voltage
            var IDX_Mainboard_VoltageInformationNameArr = 0;
            var IDX_Mainboard_VoltageInformationLocationArr = 0;
            var IDX_Mainboard_VoltageInformationVoltageArr = 0;
            var IDX_Mainboard_VoltageInformationNominalVoltageArr = 0;
            
            this.Init = function () {

                // store context to base page
                base = this;

                if (base == undefined || base == null) {
                    return false;
                }

                // init Cycle Time for cyclic refreshing values
                base.setCycleTime(CycleTime);

                // init communication
                base.setCommunicationObj(window.DevMan.getCommunicationModule(window.DevMan.CommunicationType.mdp));

                // information
                IDX_Mainboard_MainboardType = base.addParameter("Mainboard_Information_Property_MainboardType", false);
                IDX_Mainboard_SerialNumber = base.addParameter("Mainboard_Information_Property_SerialNumber", false);
                IDX_Mainboard_ProductionDate = base.addParameter("Mainboard_Information_Property_ProductionDate", false);
                IDX_Mainboard_BootCount = base.addParameter("Mainboard_Information_Property_BootCount", false);
                IDX_Mainboard_OperatingTime = base.addParameter("Mainboard_Information_Property_OperatingTime", true);
                IDX_Mainboard_MinBoardTemperature = base.addParameter("Mainboard_Information_Property_MinBoardTemperature", true);
                IDX_Mainboard_MaxBoardTemperature = base.addParameter("Mainboard_Information_Property_MaxBoardTemperature", true);
                IDX_Mainboard_MinInputVoltage = base.addParameter("Mainboard_Information_Property_MinInputVoltage", true);
                IDX_Mainboard_MaxInputVoltage = base.addParameter("Mainboard_Information_Property_MaxInputVoltage", true);
                IDX_Mainboard_MainboardTemperature = base.addParameter("Mainboard_Information_Property_MainboardTemperature", true);
                // version
                IDX_Mainboard_MainboardRevision = base.addParameter("Mainboard_VersionInformation_Property_MainboardRevision", false);
                IDX_Mainboard_BiosMajorVersion = base.addParameter("Mainboard_VersionInformation_Property_BiosMajorVersion", false);
                IDX_Mainboard_BiosMinorVersion = base.addParameter("Mainboard_VersionInformation_Property_BiosMinorVersion", false);
                IDX_Mainboard_BiosVersion = base.addParameter("Mainboard_VersionInformation_Property_BiosVersion", false);
                // voltage
                IDX_Mainboard_VoltageInformationNameArr = base.addParameter("Mainboard_VoltageInformationName_Property_Len", false);
                IDX_Mainboard_VoltageInformationLocationArr = base.addParameter("Mainboard_VoltageInformationLocation_Property_Len", false);
                IDX_Mainboard_VoltageInformationVoltageArr = base.addParameter("Mainboard_VoltageInformationVoltage_Property_Len", true);
                IDX_Mainboard_VoltageInformationNominalVoltageArr = base.addParameter("Mainboard_VoltageInformationNominalVoltage_Property_Len", false);

                // init events
                base.setOnInitStaticPage(OnInitStaticPage);
                base.setOnDisplayValues(OnDisplayValues);
                //base.setOnWriteFailed(OnWriteFailed); not used in this page
                //base.setOnWriteResult(OnWriteResult); not used in this page
                //base.setOnServiceTransferFailed(OnServiceTransferFailed); not used in this page
                //base.setOnServiceTransferResult(OnServiceTransferResult); not used in this page

                return true;
            }

            var OnInitStaticPage = function (RequestParamIDs) {

                var html = "";

                if (RequestParamIDs[IDX_Mainboard_MainboardType].getHasValues() ||
                    RequestParamIDs[IDX_Mainboard_SerialNumber].getHasValues() ||
                    RequestParamIDs[IDX_Mainboard_ProductionDate].getHasValues() ||
                    RequestParamIDs[IDX_Mainboard_BootCount].getHasValues() ||
                    RequestParamIDs[IDX_Mainboard_OperatingTime].getHasValues() ||
                    RequestParamIDs[IDX_Mainboard_MinBoardTemperature].getHasValues() ||
                    RequestParamIDs[IDX_Mainboard_MaxBoardTemperature].getHasValues() ||
                    RequestParamIDs[IDX_Mainboard_MinInputVoltage].getHasValues() ||
                    RequestParamIDs[IDX_Mainboard_MaxInputVoltage].getHasValues() ||
                    RequestParamIDs[IDX_Mainboard_MainboardTemperature].getHasValues()) {

                    html += '<h3>Mainboard information</h3>';
                    html += '<table>';

                    if (RequestParamIDs[IDX_Mainboard_MainboardType].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Type</td><td><div id="' + RequestParamIDs[IDX_Mainboard_MainboardType].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_Mainboard_SerialNumber].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Serialnumber</td><td><div id="' + RequestParamIDs[IDX_Mainboard_SerialNumber].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_Mainboard_ProductionDate].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Productiondate</td><td><div id="' + RequestParamIDs[IDX_Mainboard_ProductionDate].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_Mainboard_BootCount].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Boot count</td><td><div id="' + RequestParamIDs[IDX_Mainboard_BootCount].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_Mainboard_OperatingTime].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Operating time (min)</td><td><div id="' + RequestParamIDs[IDX_Mainboard_OperatingTime].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_Mainboard_MinBoardTemperature].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Min temperature (°C)</td><td><div id="' + RequestParamIDs[IDX_Mainboard_MinBoardTemperature].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_Mainboard_MaxBoardTemperature].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Max temperature (°C)</td><td><div id="' + RequestParamIDs[IDX_Mainboard_MaxBoardTemperature].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_Mainboard_MinInputVoltage].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Min input voltage (mV)</td><td><div id="' + RequestParamIDs[IDX_Mainboard_MinInputVoltage].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_Mainboard_MaxInputVoltage].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Max input voltage (mV)</td><td><div id="' + RequestParamIDs[IDX_Mainboard_MaxInputVoltage].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_Mainboard_MainboardTemperature].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Temperature (°C)</td><td><div id="' + RequestParamIDs[IDX_Mainboard_MainboardTemperature].parameterName + '"></div></td></tr> ';
                    }
                    
                    html += '</table>';
                    html += '<br>';
                }

                if (RequestParamIDs[IDX_Mainboard_MainboardRevision].getHasValues() ||
                    RequestParamIDs[IDX_Mainboard_BiosMajorVersion].getHasValues() ||
                    RequestParamIDs[IDX_Mainboard_BiosMinorVersion].getHasValues() ||
                    RequestParamIDs[IDX_Mainboard_BiosVersion].getHasValues()) {

                    html += '<h3>Version</h3>';

                    html += '<table>';
                    if (RequestParamIDs[IDX_Mainboard_MainboardRevision].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Mainboard revision</td><td><div id="' + RequestParamIDs[IDX_Mainboard_MainboardRevision].parameterName + '"></div></td></tr> ';
                    }
                    if (tcrtos) {
                        if (RequestParamIDs[IDX_Mainboard_BiosMajorVersion].getHasValues()) {
                            html += '<tr><td class="td_FirstColumn">Bios major</td><td><div id="' + RequestParamIDs[IDX_Mainboard_BiosMajorVersion].parameterName + '"></div></td></tr> ';
                        }
                        if (RequestParamIDs[IDX_Mainboard_BiosMinorVersion].getHasValues()) {
                            html += '<tr><td class="td_FirstColumn">Bios minor</td><td><div id="' + RequestParamIDs[IDX_Mainboard_BiosMinorVersion].parameterName + '"></div></td></tr> ';
                        }
                    }
                    else {
                        if (RequestParamIDs[IDX_Mainboard_BiosVersion].getHasValues()) {
                            html += '<tr><td class="td_FirstColumn">Bios version</td><td><div id="' + RequestParamIDs[IDX_Mainboard_BiosVersion].parameterName + '"></div></td></tr> ';
                        }
                    }
                    html += '</table>';
                    html += '<br>';
                }

                if (RequestParamIDs[IDX_Mainboard_VoltageInformationNameArr].getHasValues() ||
                    RequestParamIDs[IDX_Mainboard_VoltageInformationLocationArr].getHasValues() ||
                    RequestParamIDs[IDX_Mainboard_VoltageInformationVoltageArr].getHasValues() ||
                    RequestParamIDs[IDX_Mainboard_VoltageInformationNominalVoltageArr].getHasValues()) {

                    html += '<h3>Voltage</h3>';
                    html += '<table>';
                    html += '<tr><th>Name</th><th>Location</th><th>Voltage [mV]</th><th>Nominal Voltage [mV]</th>';

                    var RowsNames = 0;
                    if (RequestParamIDs[IDX_Mainboard_VoltageInformationNameArr].getHasValues()) { RowsNames = RequestParamIDs[IDX_Mainboard_VoltageInformationNameArr].values[0].length; }

                    var RowsLocations = 0;
                    if (RequestParamIDs[IDX_Mainboard_VoltageInformationLocationArr].getHasValues()) { RowsLocations = RequestParamIDs[IDX_Mainboard_VoltageInformationLocationArr].values[0].length; }

                    var RowsVoltages = 0;
                    if (RequestParamIDs[IDX_Mainboard_VoltageInformationVoltageArr].getHasValues()) { RowsVoltages = RequestParamIDs[IDX_Mainboard_VoltageInformationVoltageArr].values[0].length; }

                    var RowsNominalVoltages = 0;
                    if (RequestParamIDs[IDX_Mainboard_VoltageInformationNominalVoltageArr].getHasValues()) { RowsNominalVoltages = RequestParamIDs[IDX_Mainboard_VoltageInformationNominalVoltageArr].values[0].length; }

                    var Rows = Math.max(RowsNames, RowsLocations, RowsVoltages, RowsNominalVoltages);

                    for (var i = 0; i < Rows; i++) {

                        html += '<tr>';
                        html += '<td class="td_FirstColumn"><div id="' + RequestParamIDs[IDX_Mainboard_VoltageInformationNameArr].parameterName + i + '"></div></td>';
                        html += '<td><div id="' + RequestParamIDs[IDX_Mainboard_VoltageInformationLocationArr].parameterName + i + '"></div></td>';
                        html += '<td><div id="' + RequestParamIDs[IDX_Mainboard_VoltageInformationVoltageArr].parameterName + i + '"></div></td>';
                        html += '<td><div id="' + RequestParamIDs[IDX_Mainboard_VoltageInformationNominalVoltageArr].parameterName + i + '"></div></td>';
                        html += '</tr>';
                    }
                    html += '</table><br>';
                }


                html += '<div id="status"></div>';  // div for errors, etc.

                // write innerHTML of page
                base.writeActivePage(html);
                return true;
            }

            var OnDisplayValues = function (RequestParamIDs) {

                // Information
                if (RequestParamIDs[IDX_Mainboard_MainboardType].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_Mainboard_MainboardType].parameterName, RequestParamIDs[IDX_Mainboard_MainboardType].values[0].data);
                }
                if (RequestParamIDs[IDX_Mainboard_SerialNumber].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_Mainboard_SerialNumber].parameterName, RequestParamIDs[IDX_Mainboard_SerialNumber].values[0].data);
                }
                if (RequestParamIDs[IDX_Mainboard_ProductionDate].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_Mainboard_ProductionDate].parameterName, RequestParamIDs[IDX_Mainboard_ProductionDate].values[0].data);
                }
                if (RequestParamIDs[IDX_Mainboard_BootCount].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_Mainboard_BootCount].parameterName, RequestParamIDs[IDX_Mainboard_BootCount].values[0].data);
                }
                if (RequestParamIDs[IDX_Mainboard_OperatingTime].getHasValues()) {
                    var operatingTimeInMinutes = RequestParamIDs[IDX_Mainboard_OperatingTime].values[0].data;
                    base.writeElement(RequestParamIDs[IDX_Mainboard_OperatingTime].parameterName, operatingTimeInMinutes + " (" + Helper.MinutesToTimespan(operatingTimeInMinutes) + ")");
                }
                if (RequestParamIDs[IDX_Mainboard_MinBoardTemperature].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_Mainboard_MinBoardTemperature].parameterName, RequestParamIDs[IDX_Mainboard_MinBoardTemperature].values[0].data);
                }
                if (RequestParamIDs[IDX_Mainboard_MaxBoardTemperature].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_Mainboard_MaxBoardTemperature].parameterName, RequestParamIDs[IDX_Mainboard_MaxBoardTemperature].values[0].data);
                }
                if (RequestParamIDs[IDX_Mainboard_MinInputVoltage].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_Mainboard_MinInputVoltage].parameterName, RequestParamIDs[IDX_Mainboard_MinInputVoltage].values[0].data);
                }
                if (RequestParamIDs[IDX_Mainboard_MaxInputVoltage].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_Mainboard_MaxInputVoltage].parameterName, RequestParamIDs[IDX_Mainboard_MaxInputVoltage].values[0].data);
                }
                if (RequestParamIDs[IDX_Mainboard_MainboardTemperature].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_Mainboard_MainboardTemperature].parameterName, RequestParamIDs[IDX_Mainboard_MainboardTemperature].values[0].data);
                }

                // Version
                if (RequestParamIDs[IDX_Mainboard_MainboardRevision].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_Mainboard_MainboardRevision].parameterName, RequestParamIDs[IDX_Mainboard_MainboardRevision].values[0].data);
                }
                if (tcrtos) {
                    if (RequestParamIDs[IDX_Mainboard_BiosMajorVersion].getHasValues()) {
                        base.writeElement(RequestParamIDs[IDX_Mainboard_BiosMajorVersion].parameterName, RequestParamIDs[IDX_Mainboard_BiosMajorVersion].values[0].data);
                    }
                    if (RequestParamIDs[IDX_Mainboard_BiosMinorVersion].getHasValues()) {
                        base.writeElement(RequestParamIDs[IDX_Mainboard_BiosMinorVersion].parameterName, RequestParamIDs[IDX_Mainboard_BiosMinorVersion].values[0].data);
                    }
                }
                else {
                    if (RequestParamIDs[IDX_Mainboard_BiosVersion].getHasValues()) {
                        base.writeElement(RequestParamIDs[IDX_Mainboard_BiosVersion].parameterName, RequestParamIDs[IDX_Mainboard_BiosVersion].values[0].data);
                    }
                }

                // Voltage
                var RowsVoltageNames = 0;
                if (RequestParamIDs[IDX_Mainboard_VoltageInformationNameArr].getHasValues()) { RowsVoltageNames = RequestParamIDs[IDX_Mainboard_VoltageInformationNameArr].values[0].length; }
                for (var i = 0; i < RowsVoltageNames; i++) {
                    base.writeElement(RequestParamIDs[IDX_Mainboard_VoltageInformationNameArr].parameterName + i, RequestParamIDs[IDX_Mainboard_VoltageInformationNameArr].values[0][i].getOutput());
                }

                var RowsVoltageLocations = 0;
                if (RequestParamIDs[IDX_Mainboard_VoltageInformationLocationArr].getHasValues()) { RowsVoltageLocations = RequestParamIDs[IDX_Mainboard_VoltageInformationLocationArr].values[0].length; }
                for (var i = 0; i < RowsVoltageLocations; i++) {
                    base.writeElement(RequestParamIDs[IDX_Mainboard_VoltageInformationLocationArr].parameterName + i, Helper.getMainboardVoltageLocation(RequestParamIDs[IDX_Mainboard_VoltageInformationLocationArr].values[0][i].data));
                }

                var RowsVoltageVoltages = 0;
                if (RequestParamIDs[IDX_Mainboard_VoltageInformationVoltageArr].getHasValues()) { RowsVoltageVoltages = RequestParamIDs[IDX_Mainboard_VoltageInformationVoltageArr].values[0].length; }
                for (var i = 0; i < RowsVoltageVoltages; i++) {
                    base.writeElement(RequestParamIDs[IDX_Mainboard_VoltageInformationVoltageArr].parameterName + i, RequestParamIDs[IDX_Mainboard_VoltageInformationVoltageArr].values[0][i].getOutput());
                }

                var RowsVoltageNominalVoltages = 0;
                if (RequestParamIDs[IDX_Mainboard_VoltageInformationNominalVoltageArr].getHasValues()) { RowsVoltageNominalVoltages = RequestParamIDs[IDX_Mainboard_VoltageInformationNominalVoltageArr].values[0].length; }
                for (var i = 0; i < RowsVoltageNominalVoltages; i++) {
                    base.writeElement(RequestParamIDs[IDX_Mainboard_VoltageInformationNominalVoltageArr].parameterName + i, RequestParamIDs[IDX_Mainboard_VoltageInformationNominalVoltageArr].values[0][i].getOutput());
                }

            }

        }

        this.Mainboard.prototype = new window.Page_Template.Template();

    });

    window.DevMan.RegisterModule(new Page_Hardware_Mainboard.Mainboard(), window.DevMan.ModuleType.Website);

})(window);
