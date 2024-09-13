(function (window) {

    // namespace
    var Page_Software_SystemSettings = new (function () {

        this.SystemSettings = function () {

            this.category = "Software";
            this.name = "System";
            this.subnavigationicon = "sec-nav-sys-settings.png";

            var CycleTime = 2000;
            var base = undefined;

            var IDX_Time_SNTP_Server = 0;
            var IDX_Time_SNTP_Refresh = 0;
            var IDX_Time_Textual_DateTime_presentation = 0;
            var IDX_Time_Timezone = 0;
            var IDX_Time_Timezones_Len = 0;
            var IDX_Time_Timezones2_Len = 0;
            var IDX_DisplayDevice_DeviceName = 0;
            var IDX_DisplayDevice_IDxActiveDisplayMode = 0;
            var IDX_DisplayDevice_Modes_Property_Len = 0;
            var IDX_Time_SNTP_OffsetValue = 0;

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
                IDX_Time_SNTP_Server = base.addParameter("TIME_Property_SNTP_Server", true);
                IDX_Time_SNTP_Refresh = base.addParameter("TIME_Property_SNTP_Refresh", true);
                IDX_Time_Textual_DateTime_presentation = base.addParameter("TIME_Property_Textual_DateTime_presentation", true);
                IDX_Time_Timezone = base.addParameter("TIME_Property_Timezone", true);
                IDX_Time_Timezones_Len = base.addParameter("TIME_Property_Timezones_Len", false);
                IDX_Time_Timezones2_Len = base.addParameter("TIME_Property_Timezones2_Len", false);
                IDX_DisplayDevice_DeviceName = base.addParameter("DisplayDevice_Property_DeviceName", false);
                IDX_DisplayDevice_IDxActiveDisplayMode = base.addParameter("DisplayDevice_Settings_Property_IDxActiveDisplayMode", true);
                IDX_DisplayDevice_Modes_Property_Len = base.addParameter("DisplayDevice_Modes_Property_Len", false);
                IDX_Time_SNTP_OffsetValue = base.addParameter("TIME_Property_SNTP_OffsetValue", true);
                
                // init events
                base.setOnInitStaticPage(OnInitStaticPage);
                base.setOnDisplayValues(OnDisplayValues);
                base.setOnWriteFailed(OnWriteFailed); 
                base.setOnWriteResult(OnWriteResult); 
                //base.setOnServiceTransferFailed(OnServiceTransferFailed); not used in this page
                //base.setOnServiceTransferResult(OnServiceTransferResult); not used in this page

                return true;
            }

            var OnInitStaticPage = function (RequestParamIDs) {

                var html = "";
                
                if (RequestParamIDs[IDX_Time_SNTP_Server].values.length > 0 && // (S)NTP Server (can have errCode: 0xECA60105 if (S)NTP turned off)
                    RequestParamIDs[IDX_Time_SNTP_Refresh].getHasValues())     // (S)NTP Refresh
                {
                    // Time-Title with buttons to accept or cancel changes
                    var SntpTitle = "SNTP Server";
                    var SntpTurnOffDescription = "Turn Off SNTP Server";
                    var SntpActivateSettingsDescription = "Activate SNTP Settings";
                    if (tcbsd)
                    {
                        SntpTitle = "NTP Server";
                        SntpTurnOffDescription = "Turn Off NTP Server";
                        SntpActivateSettingsDescription = "Activate NTP Settings";
                    }

                    html += '<table style="margin-bottom: 5px"><tr>';
                    html += '<td class="td_trans"><h3>' + SntpTitle + '</h3></td>';
                    html += '<td class="td_Action_trans">' +
                        new ControlLib.SmallButton().Create("btnTurnOffSNTP", "power", SntpTurnOffDescription) +
                        new ControlLib.SmallButton().Create("btnWriteSNTPSettings", "save", SntpActivateSettingsDescription) +
                        new ControlLib.SmallButton().Create("btnWriteSNTPSettings_Cancel", "delete") + '</td>';
                    html += '</tr></table>';

                    // Time-Table
                    html += "<table>";
                    if (RequestParamIDs[IDX_Time_SNTP_Server].values.length > 0 &&
                        RequestParamIDs[IDX_Time_SNTP_Refresh].getHasValues()) {

                        html += '<tr><td class="td_FirstColumn">Servername</td><td>' + new ControlLib.Textbox().Create(RequestParamIDs[IDX_Time_SNTP_Server].parameterName) + '</td></tr> ';

                        var SNTPRefreshDurations = Helper.getSNTPRefreshDurationsArr();
                        html += '<tr><td class="td_FirstColumn">Refresh Rate</td><td>' + new ControlLib.Combobox().Create(RequestParamIDs[IDX_Time_SNTP_Refresh].parameterName, SNTPRefreshDurations) + '</td></tr> ';

                       if (tcrtos) {
                          var SNTPOffsetValues = Helper.getSNTPOffsetValuesArr();
                          html += '<tr><td class="td_FirstColumn">Time Offset</td><td>' + new ControlLib.Combobox().Create(RequestParamIDs[IDX_Time_SNTP_OffsetValue].parameterName, SNTPOffsetValues) + '</td></tr> ';
                       }
                    }
                    html += "</table>";
                    html += '<br>';
                }

                if (RequestParamIDs[IDX_Time_Textual_DateTime_presentation].getHasValues())      // DateTime Textual presentation
                {
                    // Time-Title with buttons to accept or cancel changes
                    html += '<table style="margin-bottom: 5px"><tr>';
                    html += '<td class="td_trans"><h3>Local Date/Time</h3></td>';
                    html += '<td class="td_Action_trans">' +
                        new ControlLib.SmallButton().Create("btnWriteTimeSettings", "save", "Save Local Date/Time") +
                        new ControlLib.SmallButton().Create("btnWriteTimeSettings_Cancel", "delete") + '</td>';
                    html += '</tr></table>';

                    // Time-Table
                    html += "<table>";
                    if (RequestParamIDs[IDX_Time_Textual_DateTime_presentation].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Date (dd.MM.yyyy)</td><td>' + new ControlLib.Textbox().Create(RequestParamIDs[IDX_Time_Textual_DateTime_presentation].parameterName + "_date") + '</td></tr>';
                        html += '<tr><td class="td_FirstColumn">Time (HH:mm:ss)</td><td>' + new ControlLib.Textbox().Create(RequestParamIDs[IDX_Time_Textual_DateTime_presentation].parameterName + "_time") + '</td></tr>';
                        if (tcbsd) {
                            html += '<tr><td class="td_FirstColumn">UTC Offset</td><td><div id="' + RequestParamIDs[IDX_Time_Textual_DateTime_presentation].parameterName + "_utc" + '"></div></td></tr>';
                        }
                    }
                    html += "</table>";
                    html += '<br>';
                }

                if (RequestParamIDs[IDX_Time_Timezone].getHasValues() &&    // Timezone Idx
                    RequestParamIDs[IDX_Time_Timezones_Len].getHasValues())      // Timezone-strings
                {

                    // Time-Title with buttons to accept or cancel changes
                    html += '<table style="margin-bottom: 5px"><tr>';
                    html += '<td class="td_trans"><h3>Timezone</h3></td>';
                    html += '<td class="td_Action_trans">' +
                        new ControlLib.SmallButton().Create("btnWriteTimezoneSettings", "save", "Save Timezone") +
                        new ControlLib.SmallButton().Create("btnWriteTimezoneSettings_Cancel", "delete") + '</td>';
                    html += '</tr></table>';

                    html += "<table>";

                    var TimeZones = [];
                    try {
                        for (var i = 0; i < RequestParamIDs[IDX_Time_Timezones_Len].values[0].length; i++) {
                            TimeZones.push(RequestParamIDs[IDX_Time_Timezones_Len].values[0][i].data);
                        }
                        for (var i = 0; i < RequestParamIDs[IDX_Time_Timezones2_Len].values[0].length; i++) {
                            TimeZones.push(RequestParamIDs[IDX_Time_Timezones2_Len].values[0][i].data);
                        }

                        html += '<tr><td class="td_FirstColumn">Timezone</td><td>' + new ControlLib.Combobox().Create(RequestParamIDs[IDX_Time_Timezone].parameterName, TimeZones, "100%") + '</td></tr>';
                    }
                    catch (e) {
                        TimeZones = [];
                    }

                    html += "</table>";
                    html += '<br>';
                }


                if (RequestParamIDs[IDX_DisplayDevice_DeviceName].getHasValues() &&    // Display names
                    RequestParamIDs[IDX_DisplayDevice_IDxActiveDisplayMode].getHasValues() && RequestParamIDs[IDX_DisplayDevice_Modes_Property_Len].getHasValues()) { // Current DisplayMode and available Modes

                    // Display Device-Title with buttons to accept or cancel changes
                    html += '<table style="margin-bottom: 5px"><tr>';
                    html += '<td class="td_trans"><h3>Display Device</h3></td>';
                    html += '<td class="td_Action_trans">' +
                        new ControlLib.SmallButton().Create("btnWriteDisplayDeviceSettings", "save", "Save Display Resolution") +
                        new ControlLib.SmallButton().Create("btnWriteDisplayDeviceSettings_Cancel", "delete") + '</td>';
                    html += '</tr></table>';


                    html += "<table>"
                    html += '<tr><th>Name</th><th>Display Resolution</th></tr>';

                    for (var i = 0; i < RequestParamIDs[IDX_DisplayDevice_DeviceName].moduleCount; i++) {

                        html += '<tr>';
                        html += '<td class="td_FirstColumn"><div id="' + RequestParamIDs[IDX_DisplayDevice_DeviceName].parameterName + i + '"></div></td>';   // Name

                        var DisplayResolutions = [];
                        var DisplayResolutionValues = [];

                        DisplayResolutions.push("");
                        DisplayResolutionValues.push(-1);
                        try {
                            for (var j = 0; j < RequestParamIDs[IDX_DisplayDevice_Modes_Property_Len].values[i].length; j++) {
                                DisplayResolutions.push(RequestParamIDs[IDX_DisplayDevice_Modes_Property_Len].values[i][j].data);
                                DisplayResolutionValues.push(j);
                            }
                        }
                        catch (e) {
                            DisplayResolutions = [];
                            DisplayResolutionValues = [];
                        }

                        html += '<td>';
                        if (DisplayResolutions.length > 0) {
                            // Combobox to choose Display Resolution 
                            html += new ControlLib.Combobox().CreateMap(RequestParamIDs[IDX_DisplayDevice_Modes_Property_Len].parameterName + i, DisplayResolutions, DisplayResolutionValues, "100%");
                        }
                        html += '</td>';

                        html += '</tr>';
                    }

                    html += '</table>';
                    html += '<br>';
                }

                html += '<div id="status"></div>';  // div for errors, etc.

                // write innerHTML of page
                base.writeActivePage(html);

                // Add Events
                if (RequestParamIDs[IDX_Time_SNTP_Server].values.length > 0 &&
                    RequestParamIDs[IDX_Time_SNTP_Refresh].getHasValues()) {

                    base.addLockListener(RequestParamIDs[IDX_Time_SNTP_Server].parameterName);
                    base.addLockListener(RequestParamIDs[IDX_Time_SNTP_Refresh].parameterName);
                    if (tcrtos) {
                        base.addLockListener(RequestParamIDs[IDX_Time_SNTP_OffsetValue].parameterName);
                    }
                    
                    base.setElementOnClick("btnTurnOffSNTP", function (_id) { return function () { TurnOffSNTP(_id); }; }(0));
                    base.setElementOnClick("btnWriteSNTPSettings", function (_id) { return function () { WriteSNTPSettings(_id); }; }(0));
                    base.setElementOnClick("btnWriteSNTPSettings_Cancel", function (_id) { return function () { WriteSNTPSettings_Cancel(_id); }; }(0));
                }

                if (RequestParamIDs[IDX_Time_Textual_DateTime_presentation].getHasValues()) {

                    base.addLockListener(RequestParamIDs[IDX_Time_Textual_DateTime_presentation].parameterName + "_date");
                    base.addLockListener(RequestParamIDs[IDX_Time_Textual_DateTime_presentation].parameterName + "_time");

                    base.setElementOnClick("btnWriteTimeSettings", function (_id) { return function () { WriteTimeSettings(_id); }; }(0));
                    base.setElementOnClick("btnWriteTimeSettings_Cancel", function (_id) { return function () { WriteTimeSettings_Cancel(_id); }; }(0));
                    if (tcbsd) {
                        base.setElementDisabled("TIME_Property_Textual_DateTime_presentation_utc");
                    }
                }

                if (RequestParamIDs[IDX_Time_Timezone].getHasValues() &&
                    RequestParamIDs[IDX_Time_Timezones_Len].getHasValues()) {

                    base.addLockListener(RequestParamIDs[IDX_Time_Timezone].parameterName);

                    base.setElementOnClick("btnWriteTimezoneSettings", function (_id) { return function () { WriteTimezoneSettings(_id); }; }(0));
                    base.setElementOnClick("btnWriteTimezoneSettings_Cancel", function (_id) { return function () { WriteTimezoneSettings_Cancel(_id); }; }(0));
                }

                if (RequestParamIDs[IDX_DisplayDevice_DeviceName].getHasValues() &&
                    RequestParamIDs[IDX_DisplayDevice_IDxActiveDisplayMode].getHasValues() && RequestParamIDs[IDX_DisplayDevice_Modes_Property_Len].getHasValues()) {

                    for (var i = 0; i < RequestParamIDs[IDX_DisplayDevice_IDxActiveDisplayMode].moduleCount; i++) {
                        base.addLockListener(RequestParamIDs[IDX_DisplayDevice_Modes_Property_Len].parameterName + i);
                    }

                    base.setElementOnClick("btnWriteDisplayDeviceSettings", function (_id) { return function () { WriteDisplayDeviceSettings(_id); }; }(0));
                    base.setElementOnClick("btnWriteDisplayDeviceSettings_Cancel", function (_id) { return function () { WriteDisplayDeviceSettings_Cancel(_id); }; }(0));
                }

                return true;
            }

            var OnDisplayValues = function (RequestParamIDs) {

                if (RequestParamIDs[IDX_Time_SNTP_Server].values.length > 0 &&
                    RequestParamIDs[IDX_Time_SNTP_Refresh].getHasValues()) {

                    base.setElementValue(RequestParamIDs[IDX_Time_SNTP_Server].parameterName, RequestParamIDs[IDX_Time_SNTP_Server].values[0].data);
                    base.setElementValue(RequestParamIDs[IDX_Time_SNTP_Refresh].parameterName, Helper.getSNTPRefreshDurationIndex(RequestParamIDs[IDX_Time_SNTP_Refresh].values[0].data));
                    if (tcrtos) {
                        base.setElementValue(RequestParamIDs[IDX_Time_SNTP_OffsetValue].parameterName, Helper.getSNTPOffsetValueIndex(RequestParamIDs[IDX_Time_SNTP_OffsetValue].values[0].data));
                    }

                    var bSNTPEnabled = true;
                    if (RequestParamIDs[IDX_Time_SNTP_Server].values[0].error == 0xECA60105) { bSNTPEnabled = false; }         // No data available
                    else if (RequestParamIDs[IDX_Time_SNTP_Server].values[0].error == 0xECA61000) { bSNTPEnabled = false; }    // Not supported

                    base.setElementDisabled(RequestParamIDs[IDX_Time_SNTP_Refresh].parameterName, !bSNTPEnabled);
                }

                if (RequestParamIDs[IDX_Time_Textual_DateTime_presentation].getHasValues()) {

                    var isoDt = new Helper.TextualDateTime_ISO8601(RequestParamIDs[IDX_Time_Textual_DateTime_presentation].values[0].data);
                    if (isoDt.isValidDate()) {

                        base.setElementValue(RequestParamIDs[IDX_Time_Textual_DateTime_presentation].parameterName + "_date", isoDt.getDateString());
                        base.setElementValue(RequestParamIDs[IDX_Time_Textual_DateTime_presentation].parameterName + "_time", isoDt.getTimeString());

                        if (tcbsd) {
                            base.writeElement(RequestParamIDs[IDX_Time_Textual_DateTime_presentation].parameterName + "_utc", isoDt.getTimezoneBiasString());
                        }
                    }
                }

                if (RequestParamIDs[IDX_Time_Timezone].getHasValues() && RequestParamIDs[IDX_Time_Timezones_Len].getHasValues()) {
                    // Write TimezoneIdx in Timezone Combobox
                    base.setElementValue(RequestParamIDs[IDX_Time_Timezone].parameterName, RequestParamIDs[IDX_Time_Timezone].values[0].data);
                }

                if (RequestParamIDs[IDX_DisplayDevice_DeviceName].getHasValues() &&
                    RequestParamIDs[IDX_DisplayDevice_IDxActiveDisplayMode].getHasValues() && RequestParamIDs[IDX_DisplayDevice_Modes_Property_Len].getHasValues()) {

                    for (var i = 0; i < RequestParamIDs[IDX_DisplayDevice_IDxActiveDisplayMode].moduleCount; i++) {

                        base.writeElement(RequestParamIDs[IDX_DisplayDevice_DeviceName].parameterName + i, RequestParamIDs[IDX_DisplayDevice_DeviceName].values[i].data);

                        var ResolutionIndex = RequestParamIDs[IDX_DisplayDevice_IDxActiveDisplayMode].values[i].data;
                        ResolutionIndex--;  // zero based ResolutionIndex

                        if (ResolutionIndex >= 0) {
                            base.setElementValue(RequestParamIDs[IDX_DisplayDevice_Modes_Property_Len].parameterName + i, ResolutionIndex);
                        }
                        else {
                            base.setElementValue(RequestParamIDs[IDX_DisplayDevice_Modes_Property_Len].parameterName + i, -1); // Empty combobox item
                        }
                    }
                }

            }


            ////////////////////////////////////////////////////////////////////////////////////////////
            // Write-Requests
            /////////////////////////////////////////////////////////////////////////////////////////
            var OnWriteFailed = function (error) {

                Helper.HideLoading();
                window.DevMan.getErrorQueue().AddError(error.requestStatus, error.requestStatusText);

                base.clearLocks();
            }

            var OnWriteResult = function (ModuleItemsWritten, ErrorCodes) {
                
                Helper.HideLoading();

                // check for errors
                for (var i = 0; i < ModuleItemsWritten.length; i++) {
                    if (ErrorCodes[i] > 0) {
                        window.DevMan.getErrorQueue().AddError(ErrorCodes[i]);
                    }
                }

                // remove Locks
                for (var i = 0; i < ModuleItemsWritten.length; i++) {

                    // check which group was written
                    if (Helper.StringStartsWith(ModuleItemsWritten[i].name, "TIME_Property_SNTP"))
                    {
                        WriteSNTPSettings_Cancel();
                    }
                    else if (Helper.StringStartsWith(ModuleItemsWritten[i].name, "TIME_Property_Textual_DateTime_presentation"))
                    {
                        WriteTimeSettings_Cancel();
                    }
                    else if (Helper.StringStartsWith(ModuleItemsWritten[i].name, "TIME_Property_Timezone"))
                    {
                        WriteTimezoneSettings_Cancel();
                    }
                    else if(Helper.StringStartsWith(ModuleItemsWritten[i].name, "DisplayDevice_"))
                    {
                        WriteDisplayDeviceSettings_Cancel();
                    }
                }

                // other functions
                for (var i = 0; i < ModuleItemsWritten.length; i++) {

                    if (ErrorCodes[i] == 0 ) {

                        if (Helper.StringStartsWith(ModuleItemsWritten[i].name, "DisplayDevice_") ||
                            ModuleItemsWritten[i].name == "TIME_Property_Timezone") {

                            // Reboot if CE
                            if (wince) {
                                RebootMachine(true);
                                break;
                            }
                        }
                    }
                }

            }

            
            var TurnOffSNTP = function (idx) {

                var writeParams = [];
                var idxs = [];
                var writeValues = [];

                writeParams.push("TIME_Property_SNTP_Server");
                idxs.push(0);
                writeValues.push("NoSync");
                
                base.Write(writeParams, idxs, writeValues);
                Helper.ShowLoading();
            }

            var WriteSNTPSettings = function (idx) {

                var writeParams = [];
                var idxs = [];
                var writeValues = [];

                if (base.isLocked("TIME_Property_SNTP_Server")) {

                    writeParams.push("TIME_Property_SNTP_Server");
                    idxs.push(0);
                    var sSNTPServer = base.getElementValue("TIME_Property_SNTP_Server");
                    if (sSNTPServer == "" && !tcrtos) { sSNTPServer = "NoSync"; }
                    writeValues.push(sSNTPServer);
                }

                var bSNTPEnabled = true;
                if (base.getRequestParamIDs()[IDX_Time_SNTP_Server].values[0].error == 0xECA60105) { bSNTPEnabled = false; }
                // If SNTP was disabled and gets activated with this write-action, update the refresh rate too!

                if (base.isLocked("TIME_Property_SNTP_Refresh") ||
                    base.isLocked("TIME_Property_SNTP_Server") && !bSNTPEnabled) {

                    writeParams.push("TIME_Property_SNTP_Refresh");
                    idxs.push(0);
                    writeValues.push(Helper.getSNTPRefreshDurationInSec(base.getElementValue("TIME_Property_SNTP_Refresh")));
                }

                if (tcrtos) {
                   // If SNTP was disabled and gets activated with this write-action, update the shift values too!
                    if (base.isLocked("TIME_Property_SNTP_OffsetValue") ||
                       base.isLocked("TIME_Property_SNTP_Server") && !bSNTPEnabled) {
  
                       writeParams.push("TIME_Property_SNTP_OffsetValue");
                       idxs.push(0);
                       writeValues.push(Helper.getSNTPOffsetValueInSec(base.getElementValue("TIME_Property_SNTP_OffsetValue")));
                   }
                }

                if (writeParams.length > 0) {
                    base.Write(writeParams, idxs, writeValues);
                    Helper.ShowLoading();
                }

            }

            var WriteSNTPSettings_Cancel = function (idx) {

                base.removeLock("TIME_Property_SNTP_Server");
                base.removeLock("TIME_Property_SNTP_Refresh");
                if (tcrtos) {
                    base.removeLock("TIME_Property_SNTP_OffsetValue");
                }
            }


            var WriteTimeSettings = function (idx) {

                var writeParams = [];
                var idxs = [];
                var writeValues = [];

                if (base.isLocked("TIME_Property_Textual_DateTime_presentation_date") ||
                    base.isLocked("TIME_Property_Textual_DateTime_presentation_time")) {

                    // prepare new date
                    var isoDt = new Helper.TextualDateTime_ISO8601(base.getRequestParamIDs()[IDX_Time_Textual_DateTime_presentation].values[0].data);
                    if (isoDt.isValidDate()) {

                        var NewDate = base.getElementValue("TIME_Property_Textual_DateTime_presentation_date");
                        var NewTime = base.getElementValue("TIME_Property_Textual_DateTime_presentation_time");

                        if (isoDt.setDateTime(NewDate, NewTime)) {

                            var isoDtStr = isoDt.getISO8601String();

                            // ISO8601 fixed in MDP
                            //if (winxp) { isoDtStr = isoDt.getISO8601NotString(); }
                            //else { isoDtStr = isoDt.getISO8601String(); }

                            if (isoDtStr.length != "") {
                                writeParams.push("TIME_Property_Textual_DateTime_presentation");
                                idxs.push(idx);
                                writeValues.push(isoDtStr);
                            }
                        }
                        else {

                            window.DevMan.getErrorQueue().AddError(0x80050030);
                        }
                    }
                }

                if (writeParams.length > 0) {
                    base.Write(writeParams, idxs, writeValues);
                    Helper.ShowLoading();
                }
            }

            var WriteTimeSettings_Cancel = function (idx) {
                
                base.removeLock("TIME_Property_Textual_DateTime_presentation_date");
                base.removeLock("TIME_Property_Textual_DateTime_presentation_time");
            }


            var WriteTimezoneSettings = function (idx) {

                var writeParams = [];
                var idxs = [];
                var writeValues = [];

                if (base.isLocked("TIME_Property_Timezone")) {

                    writeParams.push("TIME_Property_Timezone");
                    idxs.push(idx);
                    writeValues.push(base.getElementValue("TIME_Property_Timezone"));
                }

                if (writeParams.length > 0) {
                    base.Write(writeParams, idxs, writeValues);
                    Helper.ShowLoading();
                }
            }

            var WriteTimezoneSettings_Cancel = function (idx) {

                base.removeLock("TIME_Property_Timezone");
            }

            var WriteDisplayDeviceSettings = function (idx) {

                var writeParams = [];
                var idxs = [];
                var writeValues = [];

                var iDisplayDeviceModules = base.getRequestParamIDs()[IDX_DisplayDevice_IDxActiveDisplayMode].moduleCount;

                for (var i = 0; i < iDisplayDeviceModules; i++) {

                    if (base.isLocked("DisplayDevice_Modes_Property_Len" + i)) {

                        var DisplayModeIdx = base.getElementValue("DisplayDevice_Modes_Property_Len" + i);
                        DisplayModeIdx++;   // DisplayModes start @ idx 1 (mdp)

                        if (DisplayModeIdx > 0) {
                            writeParams.push("DisplayDevice_Settings_Property_IDxActiveDisplayMode");
                            idxs.push(i);

                            writeValues.push(DisplayModeIdx);
                        }
                    }
                }

                if (writeParams.length > 0) {
                    base.Write(writeParams, idxs, writeValues);
                    Helper.ShowLoading();
                }
            }

            var WriteDisplayDeviceSettings_Cancel = function (idx) {

                var iDisplayDeviceModules = base.getRequestParamIDs()[IDX_DisplayDevice_IDxActiveDisplayMode].moduleCount;

                for (var i = 0; i < iDisplayDeviceModules; i++) {
                    base.removeLock("DisplayDevice_Modes_Property_Len" + i);
                }
            }

            var RebootMachine = function (prompt) {

                if (prompt) {
                    if (!confirm("You must restart your computer to apply these changes.\nDo you really want to reboot the computer?")) {
                        return;
                    }
                }

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

        this.SystemSettings.prototype = new window.Page_Template.Template();

    });

    window.DevMan.RegisterModule(new Page_Software_SystemSettings.SystemSettings(), window.DevMan.ModuleType.Website);

})(window);
