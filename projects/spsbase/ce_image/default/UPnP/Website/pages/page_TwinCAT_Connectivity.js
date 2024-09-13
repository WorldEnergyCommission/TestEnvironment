(function (window) {

    // namespace
    var Page_TwinCAT_Connectivity = new (function () {

        this.Connectivity = function () {

            this.category = "TwinCAT";
            this.name = "Connectivity";
            this.subnavigationicon = "sec-nav-network.png";

            var CycleTime = 2000;
            var base = undefined;

            var IDX_TC_SystemId = 0;
            var IDX_TC_AmsNetId = 0;

            var IDX_TC_Route_Name_Len = 0;
            var IDX_TC_Route_AmsAdress_Len = 0;
            var IDX_TC_Route_Transport_Len = 0;
            var IDX_TC_Route_Address_Len = 0;
            var IDX_TC_Route_Timeout_Len = 0;
            var IDX_TC_Route_Flags_Len = 0;

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

                // init parameter
                IDX_TC_SystemId = base.addParameter("TwinCAT_TcMisc_Property_TwinCATSystemID", false);
                IDX_TC_AmsNetId = base.addParameter("TwinCAT_TcMisc_Property_AmsNetID", true);

                IDX_TC_Route_Name_Len = base.addParameter("TwinCAT_Property_Route_Name_Len", true);
                IDX_TC_Route_AmsAdress_Len = base.addParameter("TwinCAT_Property_Route_AMS_Address_Len", true);
                IDX_TC_Route_Transport_Len  = base.addParameter("TwinCAT_Property_Route_Transport_Len", true);
                IDX_TC_Route_Address_Len = base.addParameter("TwinCAT_Property_Route_Address_Len", true);
                IDX_TC_Route_Timeout_Len = base.addParameter("TwinCAT_Property_Route_Timeout_Len", true);
                IDX_TC_Route_Flags_Len = base.addParameter("TwinCAT_Property_Route_Flags_Len", true);
                
                // init events
                base.setOnInitStaticPage(OnInitStaticPage);
                base.setOnDisplayValues(OnDisplayValues);
                base.setOnWriteFailed(OnWriteFailed);
                base.setOnWriteResult(OnWriteResult);
                base.setOnServiceTransferFailed(OnServiceTransferFailed);
                base.setOnServiceTransferResult(OnServiceTransferResult);

                return true;
            }

            var OnInitStaticPage = function (RequestParamIDs) {

                var html = "";

                if (RequestParamIDs[IDX_TC_SystemId].getHasValues() ||
                    RequestParamIDs[IDX_TC_AmsNetId].getHasValues())
                {
                    // Time-Title with buttons to accept or cancel changes
                    html += '<table style="margin-bottom: 5px"><tr>';
                    html += '<td class="td_trans"><h3>Connectivity</h3></td>';
                    html += '<td class="td_Action_trans">' +
                        new ControlLib.SmallButton().Create("btnWriteAmsNetId", "save", "Save AMS Net Id") +
                        new ControlLib.SmallButton().Create("btnWriteAmsNetId_Cancel", "delete") + '</td>';
                    html += '</tr></table>';

                    // Time-Table
                    html += "<table>";
                    html += '<tr><td class="td_FirstColumn">System Id</td><td><div id="' + RequestParamIDs[IDX_TC_SystemId].parameterName + '"></div></td></tr>';
                    html += '<tr><td class="td_FirstColumn">AMS Net Id</td><td>' + new ControlLib.Textbox().Create(RequestParamIDs[IDX_TC_AmsNetId].parameterName + "0") + '</td></tr>';
                    html += "</table>";
                    html += '<br>';
                }

                // List/Remove TwinCAT Routes
                html += '<h3>TwinCAT Routes</h3>';
                html += '<div id="TwinCAT_Routes">No routes available</div>';
                html += '<br>';

                // Add TwinCAT Route
                html += '<table style="margin-bottom: 5px"><tr>';
                html += '<td class="td_trans"><h4>Add TwinCAT Route</h4></td>';
                html += '<td class="td_Action_trans">' +
                    new ControlLib.SmallButton().Create("btnAddTwinCATRoute", "save", "Add TwinCAT Route") +
                    new ControlLib.SmallButton().Create("btnAddTwinCATRoute_Cancel", "delete") + '</td>';
                html += '</tr></table>';

                html += '<table>';
                html += '<tr><td class="td_FirstColumn">Route Name</td><td>' + new ControlLib.Textbox().Create("txtAddRoute_Name") + '</td></tr>';
                html += '<tr><td class="td_FirstColumn">AMS Net ID</td><td>' + new ControlLib.Textbox().Create("txtAddRoute_AmsNetId") + '</td></tr>';
                var cmbItemsRouteTransportTypes = Helper.getTwinCATRouteTransportTypes();
                html += '<tr><td class="td_FirstColumn">Transport Type</td><td>' + new ControlLib.Combobox().Create("cmbAddRoute_TransportType", cmbItemsRouteTransportTypes) + '</td></tr></td>';
                html += '<tr><td class="td_FirstColumn">Address</td><td>' +
                    new ControlLib.Textbox().Create("txtAddRoute_Address") +
                    new ControlLib.Radiobutton().Create("rdAddRouteFlag_Dynamic", 2, "Host Name", true) +
                    new ControlLib.Radiobutton().Create("rdAddRouteFlag_Dynamic", 0, "IP Address", false) +
                    '</td></tr>';
                html += '<tr><td class="td_FirstColumn">Connection Timeout (ms)</td><td>' + new ControlLib.Textbox().Create("txtAddRoute_Timeout") + '</td></tr>';
                html += '<tr><td class="td_FirstColumn">Temporary</td><td>' + new ControlLib.Checkbox().Create("chkAddRouteFlag_Temporary", 1, "Delete route after next restart") + '</td></tr>';
                // not supported yet:
                // html += '<tr><td class="td_FirstColumn">No Override</td><td>' + new ControlLib.Checkbox().Create("chkAddRouteFlag_NoOverride", 4, "Do not override route") + '</td></tr>';
                html += '</table>';
                html += '<br>';
                
                html += '<div id="status"></div>';  // div for errors, etc.

                // write innerHTML of page
                base.writeActivePage(html);


                // Add Events
                base.setElementOnClick("btnAddTwinCATRoute", function (_id) { return function () { TwinCATRouteAdd(_id); }; }(0));
                base.setElementOnClick("btnAddTwinCATRoute_Cancel", function (_id) { return function () { TwinCATRouteAdd_Cancel(_id); }; }(0));

                if (RequestParamIDs[IDX_TC_SystemId].getHasValues() ||
                    RequestParamIDs[IDX_TC_AmsNetId].getHasValues())
                {
                    base.setElementOnClick("btnWriteAmsNetId", function (_id) { return function () { TwinCATSetAmsNetId(_id); }; }(0));
                    base.setElementOnClick("btnWriteAmsNetId_Cancel", function (_id) { return function () { TwinCATSetAmsNetId_Cancel(_id); }; }(0));

                    base.addLockListener(RequestParamIDs[IDX_TC_AmsNetId].parameterName + "0");
                }

                return true;
            }

            var OnDisplayValues = function (RequestParamIDs) {

                if (RequestParamIDs[IDX_TC_SystemId].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_TC_SystemId].parameterName, RequestParamIDs[IDX_TC_SystemId].values[0].data);
                }

                if (RequestParamIDs[IDX_TC_AmsNetId].getHasValues()) {
                    base.setElementValue(RequestParamIDs[IDX_TC_AmsNetId].parameterName + "0", RequestParamIDs[IDX_TC_AmsNetId].values[0].data);
                }

                if (RequestParamIDs[IDX_TC_Route_Name_Len].getHasValues()) {

                    var html = "";

                    var Rows = RequestParamIDs[IDX_TC_Route_Name_Len].values[0].length;
                    for (var i = 0; i < Rows; i++) {

                        html += '<table style="margin-bottom: 5px"><tr>';
                        html += '<td class="td_trans"><h4>#' + (i + 1) + " " + RequestParamIDs[IDX_TC_Route_Name_Len].values[0][i].data + '</h4></td>';
                        html += '<td class="td_Action_trans">' +
                            new ControlLib.SmallButton().Create("btnDelTwinCATRoute" + i, "delete", "") + '</td>';
                        html += '</tr></table>';

                        html += '<table>';
                        if (RequestParamIDs[IDX_TC_Route_AmsAdress_Len].values[0].length > i) { html += '<tr><td class="td_FirstColumn">AMS Net ID</td><td>' + RequestParamIDs[IDX_TC_Route_AmsAdress_Len].values[0][i].data + '</td></tr>'; }
                        if (RequestParamIDs[IDX_TC_Route_Transport_Len].values[0].length > i) { html += '<tr><td class="td_FirstColumn">Transport Type</td><td>' + Helper.getTwinCATRouteTransportTypeById(RequestParamIDs[IDX_TC_Route_Transport_Len].values[0][i].data) + '</tr></td>'; }
                        if (RequestParamIDs[IDX_TC_Route_Address_Len].values[0].length > i) { html += '<tr><td class="td_FirstColumn">Address</td><td>' + RequestParamIDs[IDX_TC_Route_Address_Len].values[0][i].data + '</td></tr>'; }
                        if (RequestParamIDs[IDX_TC_Route_Timeout_Len].values[0].length > i) { html += '<tr><td class="td_FirstColumn">Connection Timeout (ms)</td><td>' + RequestParamIDs[IDX_TC_Route_Timeout_Len].values[0][i].data + '</td></tr>'; }
                        if (RequestParamIDs[IDX_TC_Route_Flags_Len].values[0].length > i) { html += '<tr><td class="td_FirstColumn">Flags</td><td>' + Helper.getTwinCATRouteFlagsStr(RequestParamIDs[IDX_TC_Route_Flags_Len].values[0][i].data) + '</td></tr>'; }
                        html += '</table>';
                        html += '<br>';
                    }

                    if (Rows == 0) { html = "No routes available"; }


                    base.writeElement("TwinCAT_Routes", html);

                    // Add Events
                    for (var i = 0; i < Rows; i++) {

                        var sRouteName = RequestParamIDs[IDX_TC_Route_Name_Len].values[0][i].data;
                        base.setElementOnClick("btnDelTwinCATRoute" + i, function (_RouteName) { return function () { TwinCATRouteDelete(_RouteName); }; }(sRouteName));
                    }

                }
                else {
                    var html = "No routes available";
                    base.writeElement("TwinCAT_Routes", html);
                }
            }


            ////////////////////////////////////////////////////////////////////////////////////////////
            // Write-Requests
            /////////////////////////////////////////////////////////////////////////////////////////
            var OnWriteFailed = function (error) {

                Helper.HideLoading();
                base.clearLocks();

                window.DevMan.getErrorQueue().AddError(error.requestStatus, error.requestStatusText);
            };

            var OnWriteResult = function (ModuleItemsWritten, ErrorCodes) {

                Helper.HideLoading();

                // check for errors
                for (var i = 0; i < ModuleItemsWritten.length; i++) {
                    if (ErrorCodes[i] != 0) {
                        window.DevMan.getErrorQueue().AddError(ErrorCodes[i]);
                    }
                }

                // remove all locks with the same ID
                for (var i = 0; i < ModuleItemsWritten.length; i++) {
                    if (ModuleItemsWritten[i].name == "TwinCAT_TcMisc_Property_AmsNetID") {
                        TwinCATSetAmsNetId_Cancel(ModuleItemsWritten[i].id);
                    }
                }

                // other functions
                for (var i = 0; i < ModuleItemsWritten.length; i++) {

                    if (ErrorCodes[i] == 0) {

                        if (ModuleItemsWritten[i].name == "TwinCAT_TcMisc_Property_AmsNetID") {

                            RebootMachineApplyChanges(true);
                            break;
                        }
                    }
                }
            };

            var TwinCATSetAmsNetId = function (idx) {

                var writeParams = [];
                var idxs = [];
                var writeValues = [];

                var RequestParamIDs = base.getRequestParamIDs();

                if (base.isLocked(RequestParamIDs[IDX_TC_AmsNetId].parameterName + idx)) {

                    var szAmsNetId = base.getElementValue(RequestParamIDs[IDX_TC_AmsNetId].parameterName + idx);

                    writeParams.push(RequestParamIDs[IDX_TC_AmsNetId].parameterName);
                    idxs.push(idx);
                    writeValues.push(szAmsNetId);
                }

                if (writeParams.length > 0) {
                    base.Write(writeParams, idxs, writeValues);
                    Helper.ShowLoading();
                }
            };

            var TwinCATSetAmsNetId_Cancel = function (idx) {

                var RequestParamIDs = base.getRequestParamIDs();
                base.removeLock(RequestParamIDs[IDX_TC_AmsNetId].parameterName + idx);
            };


            ////////////////////////////////////////////////////////////////////////////////////////////
            // Service-Transfers
            /////////////////////////////////////////////////////////////////////////////////////////
            var OnServiceTransferFailed = function (error) {

                Helper.HideLoading();
                window.DevMan.getErrorQueue().AddError(error.requestStatus, error.requestStatusText);
            }

            var OnServiceTransferResult = function (serviceTransferResponse) {

                if (serviceTransferResponse.isBusy) {
                    return; // just wait
                }

                Helper.HideLoading();

                if (serviceTransferResponse.hasError) {
                    window.DevMan.getErrorQueue().AddError(serviceTransferResponse.errCode);
                }
                else {

                    // Check the specific result
                    switch (serviceTransferResponse.moduleItem.name) {

                        case "TwinCAT_Function_AddRoute":
                            TwinCATRouteAdd_Cancel(0);
                            break;

                        default:
                            break;
                    }
                }

            }

            var TwinCATRouteAdd = function (idx) {

                var CommandParamID = "TwinCAT_Function_AddRoute";

                var nFlags = 0;
                nFlags |= base.getCheckedRadioButtonValue("rdAddRouteFlag_Dynamic");
                if (base.getElementChecked("chkAddRouteFlag_Temporary")) { nFlags |= base.getElementValue("chkAddRouteFlag_Temporary"); }
                //not supported yet:
                //if (base.getElementChecked("chkAddRouteFlag_NoOverride")) { nFlags |= base.getElementValue("chkAddRouteFlag_NoOverride"); }

                var nTimeout = base.getElementValue("txtAddRoute_Timeout");
                var nTransportType = base.getElementValue("cmbAddRoute_TransportType") + 1;
                var bNetIdArr = base.getElementValue("txtAddRoute_AmsNetId").split(".");
                if (bNetIdArr.length != 6) { bNetIdArr = [0, 0, 0, 0, 0, 0]; }
                var sRouteName = base.getElementValue("txtAddRoute_Name");
                var sAddress = base.getElementValue("txtAddRoute_Address");

                var cbInputData = base.getCommunicationObj().getServiceTransferParameterSize(CommandParamID) +
                                    sRouteName.length +
                                    sAddress.length;

                var paramValues = [];
                paramValues.push(cbInputData);
                paramValues.push(nFlags);
                paramValues.push(nTimeout);
                paramValues.push(nTransportType);
                paramValues.push(bNetIdArr[0]);
                paramValues.push(bNetIdArr[1]);
                paramValues.push(bNetIdArr[2]);
                paramValues.push(bNetIdArr[3]);
                paramValues.push(bNetIdArr[4]);
                paramValues.push(bNetIdArr[5]);
                paramValues.push(sRouteName.length);
                paramValues.push(sAddress.length);
                paramValues.push(sRouteName);
                paramValues.push(sAddress);

                base.executeCommand(CommandParamID, 0, paramValues);
                Helper.ShowLoading();
            }

            var TwinCATRouteAdd_Cancel = function (idx) {

                base.setElementValue("txtAddRoute_Name", "");
                base.setElementValue("txtAddRoute_AmsNetId", "");
                base.setElementValue("cmbAddRoute_TransportType", 0);
                base.setElementValue("txtAddRoute_Address", "");
                base.setElementChecked("rdAddRouteFlag_Dynamic_Host Name");
                base.setElementValue("txtAddRoute_Timeout", "");
                base.setElementUnchecked("chkAddRouteFlag_Temporary");
            }

            var TwinCATRouteDelete = function (RouteName) {

                if (confirm("Do you really want to delete the route " + RouteName + "?")) {

                    var CommandParamID = "TwinCAT_Function_DelRoute";

                    var paramValues = [];
                    paramValues.push(RouteName.length);
                    paramValues.push(RouteName);

                    base.executeCommand(CommandParamID, 0, paramValues);
                    Helper.ShowLoading();
                }
            }

            var RebootMachineApplyChanges = function (prompt) {

                if (tcbsd) {
                    alert("You must restart your computer to apply these changes!");
                }
                else {
                    if (prompt) {
                        if (!confirm("You must restart your computer to apply these changes.\nDo you really want to reboot the computer?")) {
                            return;
                        }
                    }

                    Reboot();
                }
            }

            var Reboot = function () {

                var CommandParamID = "MISC_Function_Reboot";

                // calc length of data
                var cbInputData = base.getCommunicationObj().getServiceTransferParameterSize(CommandParamID);

                var paramValues = [];
                paramValues.push(cbInputData);
                paramValues.push(0);    // Dummy

                Helper.RebootActive();
                base.executeCommand(CommandParamID, 0, paramValues);
            }

        }

        this.Connectivity.prototype = new window.Page_Template.Template();

    });

    window.DevMan.RegisterModule(new Page_TwinCAT_Connectivity.Connectivity(), window.DevMan.ModuleType.Website);

})(window);
