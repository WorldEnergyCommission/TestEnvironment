(function (window) {

    // namespace
    var Page_Device_System = new (function () {

        this.System = function () {

            this.category = "Device";
            this.name = "System";
            this.subnavigationicon = "sec-nav-verlauf.png";

            var CycleTime = 2000;
            var base = undefined;

            var IDX_GENERAL_DeviceName = 0;
            var IDX_GENERAL_OsAndImageVersion = 0;
            var IDX_GENERAL_HardwareVersion = 0;
            var IDX_DEVICE_SerialNumber = 0;
            var IDX_TIME_DateTime = 0;
            var IDX_OS_OperatingSystemName = 0;
            var IDX_EWF_VolumeName = 0;
            var IDX_EWF_State = 0;
            var IDX_FBWF_CurrentState = 0;
            var IDX_RAID_ControllerState = 0;
            var IDX_UPS_PowerStatus = 0;
            var IDX_UPS_CommunicationStatus = 0;
            var IDX_UPS_BatteryStatus = 0;
            var IDX_CPU_Usage = 0;
            var IDX_CPU_Temperature = 0;
            var IDX_MEMORY_Allocated = 0;
            var IDX_MEMORY_Available = 0;
            var IDX_MAINBOARD_TemperatureMin = 0;
            var IDX_MAINBOARD_TemperatureMax = 0;
            var IDX_MAINBOARD_Temperature = 0;
            var IDX_MAINBOARD_VoltageLocation = 0;
            var IDX_MAINBOARD_Voltage = 0;
            var IDX_FAN_Name = 0;
            var IDX_FAN_Speed = 0;
            
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
                IDX_GENERAL_DeviceName = base.addParameter("GENERAL_Device_Name", true);
                IDX_TIME_DateTime = base.addParameter("TIME_Property_Textual_DateTime_presentation", true);
                IDX_OS_OperatingSystemName = base.addParameter("OS_Header_Property_OSName", false);
                IDX_EWF_VolumeName = base.addParameter("EWF_VolumeName_Property_Len", false);
                IDX_EWF_State = base.addParameter("EWF_State_Property_Len", true);
                IDX_FBWF_CurrentState = base.addParameter("FBWF_CurrentState_Property_State", true);
                IDX_RAID_ControllerState = base.addParameter("RAID_Property_ControllerInfo_State", true);
                IDX_UPS_PowerStatus = base.addParameter("UPS_Information_Property_PowerStatus", true);
                IDX_UPS_CommunicationStatus = base.addParameter("UPS_Information_Property_CommunicationStatus", true);
                IDX_UPS_BatteryStatus = base.addParameter("UPS_Information_Property_BatteryStatus", true);
                IDX_CPU_Usage = base.addParameter("CPU_Property_Current_CPU_Usage", true);
                if (wince)
                {
                    IDX_MEMORY_Allocated = base.addParameter("Memory_Property_Program_Memory_Allocated", true);
                    IDX_MEMORY_Available = base.addParameter("Memory_Property_Program_Memory_Available", true);
                }
                else {
                    IDX_MEMORY_Allocated = base.addParameter("Memory_Property_Program_Memory_Allocated_64", true);
                    IDX_MEMORY_Available = base.addParameter("Memory_Property_Program_Memory_Available_64", true);
                }
                IDX_CPU_Temperature = base.addParameter("CPU_Property_Current_CPU_Temperature", true);
                IDX_MAINBOARD_TemperatureMin = base.addParameter("Mainboard_Information_Property_MinBoardTemperature", true);
                IDX_MAINBOARD_TemperatureMax = base.addParameter("Mainboard_Information_Property_MaxBoardTemperature", true);
                IDX_MAINBOARD_Temperature = base.addParameter("Mainboard_Information_Property_MainboardTemperature", true);
                IDX_FAN_Name = base.addParameter("Fan_Property_AdapterName", false);
                IDX_FAN_Speed = base.addParameter("Fan_Properties_Property_Speed", true);
                IDX_DEVICE_SerialNumber = base.addParameter("DEVICE_IPC_Serial_Number", true);
                IDX_MAINBOARD_VoltageLocation = base.addParameter("Mainboard_VoltageInformationLocation_Property_Len", false);
                IDX_MAINBOARD_Voltage = base.addParameter("Mainboard_VoltageInformationVoltage_Property_Len", true);
                IDX_GENERAL_OsAndImageVersion = base.addParameter("GENERAL_OS_and_Image_Version", false);
                IDX_GENERAL_HardwareVersion = base.addParameter("GENERAL_Hardware_Version", false);

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
                
                if (window.ProductName != undefined ||
                    RequestParamIDs[IDX_GENERAL_DeviceName].getHasValues() ||
                    RequestParamIDs[IDX_TIME_DateTime].getHasValues() ||
                    RequestParamIDs[IDX_OS_OperatingSystemName].getHasValues() ||
                    RequestParamIDs[IDX_DEVICE_SerialNumber].getHasValues() ||
                    RequestParamIDs[IDX_MAINBOARD_Voltage].getHasValues() ||
                    RequestParamIDs[IDX_GENERAL_OsAndImageVersion].getHasValues() ||
                    RequestParamIDs[IDX_GENERAL_HardwareVersion].getHasValues()) {

                    if (RequestParamIDs[IDX_GENERAL_DeviceName].getHasValues()) {    

                        html += '<table style="margin-bottom: 5px"><tr>';
                        html += '<td class="td_trans"><h3>Device</h3></td>';
                        html += '<td class="td_Action_trans">' +
                            new ControlLib.SmallButton().Create("btnWriteComputername", "save", "Save Computername") +
                            new ControlLib.SmallButton().Create("btnWriteComputername_Cancel", "delete") + '</td>';
                        html += '</tr></table>';

                        html += '<table>';
                        html += '<tr><td class="td_FirstColumn">Name</td><td>' + new ControlLib.Textbox().Create(RequestParamIDs[IDX_GENERAL_DeviceName].parameterName) + '</td></tr> ';

                        // Set title of Website "%ComputerName% - Device Manager"
                        var sTitle = RequestParamIDs[IDX_GENERAL_DeviceName].values[0].data + " - Device Manager";
                        try { if (document.title != sTitle) { document.title = sTitle; } } catch (e) { }
                    }
                    else {
                        html += '<h3>Device</h3>';
                        html += '<table>';
                    }

                    if (RequestParamIDs[IDX_TIME_DateTime].getHasValues()) {    
                        html += '<tr><td class="td_FirstColumn">Date Time</td><td><div id="' + RequestParamIDs[IDX_TIME_DateTime].parameterName + '"></div></td></tr> ';
                    }

                    if (RequestParamIDs[IDX_OS_OperatingSystemName].getHasValues()) {    
                        html += '<tr><td class="td_FirstColumn">Operating System</td><td><div id="' + RequestParamIDs[IDX_OS_OperatingSystemName].parameterName + '"></div></td></tr> ';
                    }

                    if (RequestParamIDs[IDX_GENERAL_OsAndImageVersion].getHasValues()) {
                        if (window.Helper.getOsAndImageVersion(RequestParamIDs[IDX_GENERAL_OsAndImageVersion].values[0].data).length > 0) { // valid data available?
                            html += '<tr><td class="td_FirstColumn">Image Version</td><td><div id="' + RequestParamIDs[IDX_GENERAL_OsAndImageVersion].parameterName + '"></div></td></tr> ';
                        }
                    }

                    if (RequestParamIDs[IDX_GENERAL_HardwareVersion].getHasValues()) {
                        if (window.Helper.getHardwareVersion(RequestParamIDs[IDX_GENERAL_HardwareVersion].values[0].data).length > 0) { // valid data available?
                            html += '<tr><td class="td_FirstColumn">Hardware Version</td><td><div id="' + RequestParamIDs[IDX_GENERAL_HardwareVersion].parameterName + '"></div></td></tr> ';
                        }
                    }

                    if (RequestParamIDs[IDX_DEVICE_SerialNumber].getHasValues()) {    
                        html += '<tr><td class="td_FirstColumn">Serial number of IPC</td><td><div id="' + RequestParamIDs[IDX_DEVICE_SerialNumber].parameterName + '"></div></td></tr> ';
                    }

                    // Device Manager Version
                    if (window.ProductName != undefined &&
                        window.ProductMajor != undefined && window.ProductMinor != undefined && window.ProductRevision != undefined && window.ProductBuild != undefined) {

                        html += '<tr><td class="td_FirstColumn">Device Manager Version</td><td>' +
                            window.ProductMajor + "." +
                            window.ProductMinor + "." +
                            window.ProductRevision + "." +
                            window.ProductBuild +
                            '</div></td></tr> ';
                    }

                    html += '</table>';
                    html += '<br/>';
                }
               
                if (RequestParamIDs[IDX_CPU_Usage].getHasValues() ||
                    RequestParamIDs[IDX_MEMORY_Allocated].getHasValues() ||
                    RequestParamIDs[IDX_MEMORY_Available].getHasValues() ||
                    RequestParamIDs[IDX_CPU_Temperature].getHasValues() ||
                    RequestParamIDs[IDX_MAINBOARD_TemperatureMin].getHasValues() ||
                    RequestParamIDs[IDX_MAINBOARD_TemperatureMax].getHasValues() ||
                    RequestParamIDs[IDX_MAINBOARD_Temperature].getHasValues()) {

                    html += '<div id="graphs" style="overflow:auto;min-width:250px;">';

                    if (RequestParamIDs[IDX_CPU_Usage].getHasValues() ||
                        RequestParamIDs[IDX_MEMORY_Allocated].getHasValues() && RequestParamIDs[IDX_MEMORY_Available].getHasValues()) {

                        html += '   <div id="workloads" style="float:left;">';
                        html += '   <h3>Workload</h3>';

                        if (RequestParamIDs[IDX_CPU_Usage].getHasValues()) {
                            html += '       <div id="' + RequestParamIDs[IDX_CPU_Usage].parameterName + '"></div>';
                        }

                        if (RequestParamIDs[IDX_MEMORY_Allocated].getHasValues() &&
                            RequestParamIDs[IDX_MEMORY_Available].getHasValues()) {
                            html += '       <div id="' + RequestParamIDs[IDX_MEMORY_Allocated].parameterName + '"></div>';
                        }

                        html += '   </div>';
                    }

                    if (RequestParamIDs[IDX_CPU_Temperature].getHasValues() ||
                        RequestParamIDs[IDX_MAINBOARD_Temperature].getHasValues()) {

                        html += '   <div id="temperatures" style="float:left;">';
                        html += '       <h3>Temperature</h3>';


                        if (RequestParamIDs[IDX_CPU_Temperature].getHasValues()) {
                            html += '       <div id="' + RequestParamIDs[IDX_CPU_Temperature].parameterName + '"></div>';
                        }
                        if (RequestParamIDs[IDX_MAINBOARD_Temperature].getHasValues()) {
                            html += '       <div id="' + RequestParamIDs[IDX_MAINBOARD_Temperature].parameterName + '"></div>';
                        }

                        html += '   </div>';
                    }

                    html += '<div style="clear:both"></div>';
                    html += '</div>';   // div graphs
                }
                
                if (RequestParamIDs[IDX_FAN_Name].getHasValues() ||
                    RequestParamIDs[IDX_FAN_Speed].getHasValues()) {

                    html += '<h3>FAN</h3>';
                    html += '<table>';

                    var Rows = Math.max(RequestParamIDs[IDX_FAN_Name].moduleCount,
                                        RequestParamIDs[IDX_FAN_Speed].moduleCount);

                    for (var i = 0; i < Rows; i++) {

                        html += '<tr>';
                        html += '<td class="td_FirstColumn"><div id="' + RequestParamIDs[IDX_FAN_Name].parameterName + i + '"></div></td>'; 
                        html += '<td><div id="' + RequestParamIDs[IDX_FAN_Speed].parameterName + i + '"></div></td>';
                        html += '</tr>';
                    }

                    html += '</table>';
                    html += '<br/>';
                }

                if (RequestParamIDs[IDX_UPS_PowerStatus].getHasValues() ||
                    RequestParamIDs[IDX_UPS_CommunicationStatus].getHasValues() ||
                    RequestParamIDs[IDX_UPS_BatteryStatus].getHasValues()) {

                    html += '<h3>UPS</h3>';
                    html += '<table>';

                    if (RequestParamIDs[IDX_UPS_PowerStatus].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Power Status</td><td><div id="' + RequestParamIDs[IDX_UPS_PowerStatus].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_UPS_CommunicationStatus].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Communication Status</td><td><div id="' + RequestParamIDs[IDX_UPS_CommunicationStatus].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_UPS_BatteryStatus].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Battery Status</td><td><div id="' + RequestParamIDs[IDX_UPS_BatteryStatus].parameterName + '"></div></td></tr> ';
                    }

                    html += '</table>';
                    html += '<br/>';
                }

                if (RequestParamIDs[IDX_RAID_ControllerState].getHasValues()) {
                    html += '<div>';
                    html += '<h3>RAID</h3>';
                    html += '<table >';
                    html += '<tr><td class="td_FirstColumn">Controller Status</td><td><div id="' + RequestParamIDs[IDX_RAID_ControllerState].parameterName + '"></div></td></tr> ';
                    html += '</table>';
                    html += '</div>';
                    html += '<br/>';
                }

                if (RequestParamIDs[IDX_MAINBOARD_VoltageLocation].getHasValues() &&
                    RequestParamIDs[IDX_MAINBOARD_Voltage].getHasValues()) {

                    var RowsVoltageLocations = RequestParamIDs[IDX_MAINBOARD_VoltageLocation].values[0].length;
                    for (var i = 0; i < RowsVoltageLocations; i++) {

                        // find LOCATION_BATTERY
                        if (RequestParamIDs[IDX_MAINBOARD_VoltageLocation].values[0][i].data == 13) {

                            // Mainboard_VoltageInformationVoltage_Property @ 21!
                            if (RequestParamIDs[IDX_MAINBOARD_Voltage].values[0].length > i) {
                                html += '<h3>Voltage</h3>';
                                html += '<table>';
                                html += '<td class="td_FirstColumn">Battery (mV)</td>';
                                html += '<td><div id="' + RequestParamIDs[IDX_MAINBOARD_Voltage].parameterName + '"></div></td>';
                                html += '</table>';
                                html += '<br/>';
                                break;
                            }
                        }
                    }
                }

                if (RequestParamIDs[IDX_EWF_VolumeName].getHasValues() && RequestParamIDs[IDX_EWF_State].getHasValues() ||
                    RequestParamIDs[IDX_FBWF_CurrentState].getHasValues()) {

                    html += '<h3>WriteFilter</h3>';
                    
                    if (RequestParamIDs[IDX_EWF_VolumeName].getHasValues() ||
                        RequestParamIDs[IDX_EWF_State].getHasValues()) {
                        
                        html += '<div id=WriteFilter_EWF></div>';
                    }

                    if (RequestParamIDs[IDX_FBWF_CurrentState].getHasValues()) {
                        html += '<h4>Filebased Write Filter (FBWF)</h4>';

                        html += '<table>';
                        html += '<tr><td class="td_FirstColumn">FBWF Status</td><td><div id="' + RequestParamIDs[IDX_FBWF_CurrentState].parameterName + '"></div></td></tr> ';
                        html += '</table>';
                    }

                    html += "<br/>";
                }
                

                html += '<div id="status"></div>';  // div for errors, etc.

                // write innerHTML of page
                base.writeActivePage(html);

                // Locks & Events
                base.setElementOnClick("btnWriteComputername", function (_id) { return function () { WriteComputername(_id); }; }(0));
                base.setElementOnClick("btnWriteComputername_Cancel", function (_id) { return function () { WriteComputername_Cancel(_id); }; }(0));

                base.addLockListener(RequestParamIDs[IDX_GENERAL_DeviceName].parameterName);

                return true;
            }

            var OnDisplayValues = function (RequestParamIDs) {

                if (RequestParamIDs[IDX_GENERAL_DeviceName].getHasValues()) {    
                    base.setElementValue(RequestParamIDs[IDX_GENERAL_DeviceName].parameterName, RequestParamIDs[IDX_GENERAL_DeviceName].values[0].data);
                }

                if (RequestParamIDs[IDX_TIME_DateTime].getHasValues()) {    

                    var isoDt = new Helper.TextualDateTime_ISO8601(RequestParamIDs[IDX_TIME_DateTime].values[0].data);
                    if (isoDt.isValidDate) {

                        var sDateTime = isoDt.getDateString() + " " + isoDt.getTimeString();
                        base.writeElement(RequestParamIDs[IDX_TIME_DateTime].parameterName, sDateTime);
                    }
                }

                if (RequestParamIDs[IDX_OS_OperatingSystemName].getHasValues()) {    
                    base.writeElement(RequestParamIDs[IDX_OS_OperatingSystemName].parameterName, RequestParamIDs[IDX_OS_OperatingSystemName].values[0].data);    
                }

                if (RequestParamIDs[IDX_GENERAL_OsAndImageVersion].getHasValues()) {
                    var sOsAndImageVersion = window.Helper.getOsAndImageVersion(RequestParamIDs[IDX_GENERAL_OsAndImageVersion].values[0].data);    // valid data available?
                    if (sOsAndImageVersion.length > 0) {
                        base.writeElement(RequestParamIDs[IDX_GENERAL_OsAndImageVersion].parameterName, sOsAndImageVersion);
                    }
                }

                if (RequestParamIDs[IDX_GENERAL_HardwareVersion].getHasValues()) {
                    var sHardwareVersion = window.Helper.getHardwareVersion(RequestParamIDs[IDX_GENERAL_HardwareVersion].values[0].data);  // valid data available?
                    if (sHardwareVersion.length > 0) {
                        base.writeElement(RequestParamIDs[IDX_GENERAL_HardwareVersion].parameterName, sHardwareVersion);
                    }
                }

                if (RequestParamIDs[IDX_DEVICE_SerialNumber].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_DEVICE_SerialNumber].parameterName, RequestParamIDs[IDX_DEVICE_SerialNumber].values[0].data);
                }
                
                // EWF is array, so update table on every event
                if (RequestParamIDs[IDX_EWF_VolumeName].getHasValues() && RequestParamIDs[IDX_EWF_State].getHasValues()) {

                    var html = "";
                    html += '<h4>Enhanced Write Filter (EWF)</h4>';
                    html += '<table>';
                    html += '<tr><th style="width:150px">Volume name</th><th>State</th></tr>';

                    var RowsNames = 0;
                    if (RequestParamIDs[IDX_EWF_VolumeName].getHasValues()) { RowsNames = RequestParamIDs[IDX_EWF_VolumeName].values[0].length; }

                    var RowsStates = 0;
                    if (RequestParamIDs[IDX_EWF_State].getHasValues()) { RowsStates = RequestParamIDs[IDX_EWF_State].values[0].length; }

                    var Rows = Math.max(RowsNames, RowsStates);

                    for (var i = 0; i < Rows; i++) {

                        html += '<tr>';

                        try {
                            // EWF Volumes
                            html += '<td class="td_FirstColumn"><div id="' + RequestParamIDs[IDX_EWF_VolumeName].parameterName + i + '">' + RequestParamIDs[IDX_EWF_VolumeName].values[0][i].getOutput() + '</div></td>';
                        }
                        catch (e) {
                            html += '<td class="td_FirstColumn"></td>';
                        }

                        try {
                            // EWF Volume states
                            html += '<td><div id="' + RequestParamIDs[IDX_EWF_State].parameterName + i + '">' + window.Helper.getEWFStatusString(RequestParamIDs[IDX_EWF_State].values[0][i].getOutput()) + '</div></td>';
                        }
                        catch (e) {
                            html += '<td></td>';
                        }

                        html += '</tr>';
                    }

                    html += '</table>';
                    html += '<br/>';

                    // update container div
                    base.writeElement("WriteFilter_EWF", html);
                }
                
                if (RequestParamIDs[IDX_FBWF_CurrentState].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_FBWF_CurrentState].parameterName, window.Helper.getStatusString(RequestParamIDs[IDX_FBWF_CurrentState].values[0].data));    
                }

                if (RequestParamIDs[IDX_RAID_ControllerState].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_RAID_ControllerState].parameterName, window.Helper.getRaidState(RequestParamIDs[IDX_RAID_ControllerState].values[0].data));    
                }

                if (RequestParamIDs[IDX_UPS_PowerStatus].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_UPS_PowerStatus].parameterName, window.Helper.getUPSPowerStatusInfo(RequestParamIDs[IDX_UPS_PowerStatus].values[0].data));
                }
                if (RequestParamIDs[IDX_UPS_CommunicationStatus].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_UPS_CommunicationStatus].parameterName, window.Helper.getUPSCommunicationStatusInfo(RequestParamIDs[IDX_UPS_CommunicationStatus].values[0].data));
                }
                if (RequestParamIDs[IDX_UPS_BatteryStatus].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_UPS_BatteryStatus].parameterName, window.Helper.getUPSBatteryStatusInfo(RequestParamIDs[IDX_UPS_BatteryStatus].values[0].data));
                }
                
                //  Workloads
                if (RequestParamIDs[IDX_CPU_Usage].getHasValues()) {

                    base.writeElement(RequestParamIDs[IDX_CPU_Usage].parameterName, new ControlLib.Bargraph().CreateDefaultBar(
                        "res/modules/cpu/kachelicons-sw-groesse-1-cpu_32.png", "CPU", "%", 100, RequestParamIDs[IDX_CPU_Usage].values[0].data));
                }

                if (RequestParamIDs[IDX_MEMORY_Allocated].getHasValues() && RequestParamIDs[IDX_MEMORY_Available].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_MEMORY_Allocated].parameterName, new ControlLib.Bargraph().CreateDefaultBar(
                        "res/modules/ram/kachelicons-sw-groesse-1-ram_32.png", "Memory", "%", 100,
                            window.Helper.getMemoryUsagePercent(RequestParamIDs[IDX_MEMORY_Allocated].values[0].data, RequestParamIDs[IDX_MEMORY_Available].values[0].data)));
                }

                // Temperatures
                if (RequestParamIDs[IDX_CPU_Temperature].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_CPU_Temperature].parameterName, new ControlLib.Bargraph().CreateDefaultBar_NoMaxDisplay(
                        "res/modules/cpu/kachelicons-sw-groesse-1-cpu_32.png", "CPU", "°C", 100,
                        RequestParamIDs[IDX_CPU_Temperature].values[0].data));
                }

                if (RequestParamIDs[IDX_MAINBOARD_TemperatureMax].getHasValues() && RequestParamIDs[IDX_MAINBOARD_Temperature].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_MAINBOARD_Temperature].parameterName, new ControlLib.Bargraph().CreateDefaultBar_NoMaxDisplay(
                        "res/modules/mainboard/kachelicons-sw-groesse-1-mainboard32.png", "Mainboard", "°C", 100,     
                        RequestParamIDs[IDX_MAINBOARD_Temperature].values[0].data));   
                }

                if (RequestParamIDs[IDX_FAN_Name].getHasValues() ||
                    RequestParamIDs[IDX_FAN_Speed].getHasValues()) {

                    var Rows = Math.max(RequestParamIDs[IDX_FAN_Name].moduleCount,
                                        RequestParamIDs[IDX_FAN_Speed].moduleCount);

                    for (var i = 0; i < Rows; i++) {
                        if (RequestParamIDs[IDX_FAN_Name].values.length > i) {
                            base.writeElement(RequestParamIDs[IDX_FAN_Name].parameterName + i, RequestParamIDs[IDX_FAN_Name].values[i].getOutput() + " (rpm)");
                        }

                        if (RequestParamIDs[IDX_FAN_Speed].values.length > i) {
                            base.writeElement(RequestParamIDs[IDX_FAN_Speed].parameterName + i, RequestParamIDs[IDX_FAN_Speed].values[i].getOutput());
                        }
                    }
                }

                if (RequestParamIDs[IDX_MAINBOARD_VoltageLocation].getHasValues() &&
                    RequestParamIDs[IDX_MAINBOARD_Voltage].getHasValues()) {

                    var RowsVoltageLocations = RequestParamIDs[IDX_MAINBOARD_VoltageLocation].values[0].length;
                    for (var i = 0; i < RowsVoltageLocations; i++) {

                        // find LOCATION_BATTERY
                        if (RequestParamIDs[IDX_MAINBOARD_VoltageLocation].values[0][i].data == 13) {

                            if (RequestParamIDs[IDX_MAINBOARD_Voltage].values[0].length > i) {
                                base.writeElement(RequestParamIDs[IDX_MAINBOARD_Voltage].parameterName, RequestParamIDs[IDX_MAINBOARD_Voltage].values[0][i].getOutput());
                                break;
                            }
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
                    base.removeLock(ModuleItemsWritten[i].name);
                }

                // other functions
                for (var i = 0; i < ModuleItemsWritten.length; i++) {
                    if (ErrorCodes[i] == 0 &&
                        ModuleItemsWritten[i].name == "GENERAL_Device_Name") {

                        if (winxp || wince) {
                            // Computer name successfully changed 
                            if (RebootMachineNoWait(true)) {

                                // and the user wants to reboot at once 
                                // ...stop the website 
                                base.Stop();

                                // ...and tell the user to login with the new computername after restart
                                var html = "";
                                html += "<h3>Computer name successfully changed...</h3>";
                                html += "<h4>Please log in using the new computer name after the device is restarted.<h4>";
                                base.writeActivePage(html);
                            }
                        }
                    }
                }

            }

            var WriteComputername = function (idx) {

                var writeParams = [];
                var idxs = [];
                var writeValues = [];

                var RequestParamIDs = base.getRequestParamIDs();

                if (base.isLocked(RequestParamIDs[IDX_GENERAL_DeviceName].parameterName)) {

                    var szComputername = base.getElementValue(RequestParamIDs[IDX_GENERAL_DeviceName].parameterName);

                    writeParams.push(RequestParamIDs[IDX_GENERAL_DeviceName].parameterName);
                    idxs.push(0);
                    writeValues.push(szComputername);
                }

                if (writeParams.length > 0) {
                    base.Write(writeParams, idxs, writeValues);
                    Helper.ShowLoading();
                }
            }

            var WriteComputername_Cancel = function (idx) {

                var RequestParamIDs = base.getRequestParamIDs();

                base.removeLock(RequestParamIDs[IDX_GENERAL_DeviceName].parameterName);
            }



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
            }

            var RebootMachineNoWait = function (prompt) {

                if (prompt) {
                    if (!confirm("You must restart your computer to apply these changes.\nDo you really want to reboot the computer?")) {
                        return false;
                    }
                }

                var CommandParamID = "MISC_Function_Reboot";

                // calc length of data
                var cbInputData = base.getCommunicationObj().getServiceTransferParameterSize(CommandParamID);

                var paramValues = [];
                paramValues.push(cbInputData);
                paramValues.push(0);    // Dummy

                Helper.RebootActiveNoWait(); // NO WAIT: the website will not reload the current page
                base.executeCommand(CommandParamID, 0, paramValues);
                return true;
            }

        }

        this.System.prototype = new window.Page_Template.Template();

    });

    window.DevMan.RegisterModule(new Page_Device_System.System(), window.DevMan.ModuleType.Website);

})(window);
