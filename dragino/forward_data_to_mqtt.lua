--  Life file system
local lfs = require("lfs")
function getDeviceToCloudMqttTopic(projectId)
    return 'projects/' .. projectId .. '/messages'
end

function publishMeasurementToMqtt(mqttHost, mqttPort, mqttUser, mqttPass, projectId, variableName, variableUnit,
                                  variableValue, variableUnixTimestamp, qualityOfService, certificateFilePath)
    os.execute('mosquitto_pub -u "' ..
        mqttUser ..
        '" -p "' ..
        mqttPort ..
        '" -P "' ..
        mqttPass ..
        '" -h "' ..
        mqttHost ..
        '" -t "' ..
        getDeviceToCloudMqttTopic(projectId) ..
        '"  -m "[{\\"n\\":\\"' ..
        variableName ..
        '\\",\\"u\\":\\"' ..
        variableUnit ..
        '\\",\\"v\\":' ..
        variableValue ..
        ',\\"t\\":' ..
        variableUnixTimestamp .. '}]" -q "' .. qualityOfService .. '" --cafile "' .. certificateFilePath .. '"')
end

function sleepFor(seconds)
    os.execute('sleep ' .. seconds)
end

----------------------------------------------------------------
-- listItemsInDirectory ( Get Files name in a directory)
-- directory : path
-- Date changes :2024/03/18
----------------------------------------------------------------
function listItemsInDirectory(directory)
    local i, t = 0, {}
    for file in lfs.dir(directory) do
        if file ~= "." and file ~= ".." then
            i = i + 1
            t[i] = file
        end
    end
    return t
end

function getParameterAtIndex(index)
    local parameter = ''
    for parameterLine in io.popen('uci get customized_script.general.para' .. index):lines() do
        parameter = parameterLine
    end
    return parameter
end

function bitwiseAnd(a, b)
    local result = 0
    local bitValue = 1
    while a > 0 and b > 0 do
        if a % 2 == 1 and b % 2 == 1 then
            result = result + bitValue
        end
        bitValue = bitValue * 2
        a = math.floor(a / 2)
        b = math.floor(b / 2)
    end
    return result
end

function computeStateOfCharge(currentVoltage, minimumVoltage, maximumVoltage)
    local stateOfChargePercentage = (currentVoltage - minimumVoltage) / (maximumVoltage - minimumVoltage) * 100
    if stateOfChargePercentage < 0 then
        stateOfChargePercentage = 0
    end
    if stateOfChargePercentage > 100 then
        stateOfChargePercentage = 100
    end
    return stateOfChargePercentage
end

function twoBytesIntToDecimal(integer)
    local decimal = bitwiseAnd(integer, 0xFFFF)
    if bitwiseAnd(decimal, 0x8000) > 0 then
        decimal = -(0x10000 - decimal)
    end
    return decimal
end

function generateMeasurementsFromLSN50v2D23Payload(payloadBytes)
    local getTemperature = function(start_index, bytes)
        local intermediateRepresentation = bytes[start_index] * 256 + bytes[start_index + 1]
        return twoBytesIntToDecimal(intermediateRepresentation) / 10
    end
    local measurements = {}
    if #payloadBytes ~= 11 then
        return measurements
    end
    local mode = math.floor(bitwiseAnd(payloadBytes[7], 0x7C) / 4)
    if mode ~= 3 then
        return measurements
    end
    local startOffsets = { 3, 8, 10 }
    local index = 0
    for _, offset in pairs(startOffsets) do
        index = index + 1
        local temperature = getTemperature(offset, payloadBytes)
        measurements['temp_c' .. index] = { '°C', temperature, 0 }
    end
    local batteryVoltage = (payloadBytes[1] * 256 + payloadBytes[2]) / 1000
    local stateOfCharge = computeStateOfCharge(batteryVoltage, 2.5, 3.65)
    measurements['soc'] = { '%', stateOfCharge, 0 }
    return measurements
end

function generateMeasurementsFromLHT65NPayload(payloadBytes)
    local getTemperature = function(start_index, bytes)
        local intermediateRepresentation = bytes[start_index] * 256 + bytes[start_index + 1]
        return twoBytesIntToDecimal(intermediateRepresentation) / 100
    end
    local measurements = {}
    if #payloadBytes ~= 11 then
        return measurements
    end
    local batteryVoltage = (bitwiseAnd(payloadBytes[1], 0x3F) * 256 + payloadBytes[2]) / 1000
    local stateOfCharge = computeStateOfCharge(batteryVoltage, 2.5, 3)
    measurements['soc'] = { '%', stateOfCharge, 0 }
    local humidityPercentage = (payloadBytes[5] * 256 + payloadBytes[6]) / 10
    measurements['humidity'] = { '%', humidityPercentage, 0 }
    if payloadBytes[7] == 1 then
        local temperature = getTemperature(8, payloadBytes)
        measurements['temp'] = { '°C', temperature, 0 }
    end
    return measurements
end

----------------------------------------------------------------
-- byte1Temp (ERS-CO2 Temprature)
-- i : Counter ofPayloadBytes
-- measurements : collecting of message to mqtt message
-- payloadBytes : array loaded from file
-- step : number of bytes we should go forward
-- Date changes :2024/03/18
----------------------------------------------------------------

function byte1Temp(i, measurements, payloadBytes, step)
    local intermediateRepresentation = payloadBytes[i + 1] * 256 + payloadBytes[i + 2]
    measurements['temp'] = { '°C', twoBytesIntToDecimal(intermediateRepresentation) / 10, 0 }

    return i + step
end

----------------------------------------------------------------
-- byte2Humidity (ERS-CO2 Humidity)
-- i : Counter ofPayloadBytes
-- measurements : collecting of message to mqtt message
-- payloadBytes : array loaded from file
-- step : number of bytes we should go forward
-- Date changes :2024/03/18
----------------------------------------------------------------

function byte2Humidity(i, measurements, payloadBytes, step)
    measurements['humidity'] = { '%', payloadBytes[i + 1], 0 }

    return i + step
end

----------------------------------------------------------------
-- byte4Light (ERS-CO2 Light)
-- i : Counter ofPayloadBytes
-- measurements : collecting of message to mqtt message
-- payloadBytes : array loaded from file
-- step : number of bytes we should go forward
-- Date changes :2024/03/18
----------------------------------------------------------------
function byte4Light(i, measurements, payloadBytes, step)
    measurements['light'] = { 'lx', payloadBytes[i + 1] * 256 + payloadBytes[i + 2], 0 }

    return i + step
end

----------------------------------------------------------------
-- byte5Motion (ERS-CO2 Motion)
-- i : Counter ofPayloadBytes
-- measurements : collecting of message to mqtt message
-- payloadBytes : array loaded from file
-- step : number of bytes we should go forward
-- Date changes :2024/03/18
----------------------------------------------------------------
function byte5Motion(i, measurements, payloadBytes, step)
    measurements['motion'] = { '', payloadBytes[i + 1], 0 }

    return i + step
end

----------------------------------------------------------------
-- byte6CO2 (ERS-CO2 CO2)
-- i : Counter ofPayloadBytes
-- measurements : collecting of message to mqtt message
-- payloadBytes : array loaded from file
-- step : number of bytes we should go forward
-- Date changes :2024/03/18
----------------------------------------------------------------
function byte6CO2(i, measurements, payloadBytes, step)
    measurements['co2'] = { 'ppm', payloadBytes[i + 1] * 256 + payloadBytes[i + 2], 0 }

    return i + step
end

----------------------------------------------------------------
-- byte7SOC (ERS-CO2 SOC)
-- i : Counter ofPayloadBytes
-- measurements : collecting of message to mqtt message
-- payloadBytes : array loaded from file
-- step : number of bytes we should go forward
-- Date changes :2024/03/18
----------------------------------------------------------------
function byte7SOC(i, measurements, payloadBytes, step)
    local batteryVoltage = (payloadBytes[i + 1] * 256 + payloadBytes[i + 2]) / 1000
    local stateOfCharge = computeStateOfCharge(batteryVoltage, 2.5, 3.65)
    measurements['soc'] = { '%', stateOfCharge, 0 }

    return i + step
end

----------------------------------------------------------------
-- Addstep (going Steps forward)
-- i : Counter ofPayloadBytes
-- measurements : collecting of message to mqtt message
-- payloadBytes : array loaded from file
-- step : number of bytes we should go forward
-- Date changes :2024/03/18
----------------------------------------------------------------
function Addstep(i, measurements, payloadBytes, step)
    return i + step
end

----------------------------------------------------------------
-- generateMeasurementsFromERSCO2Payload ( Generates measurements from Files to send to mqtt message)
-- payloadBytes : line read from file
-- Date changes :2024/03/18
----------------------------------------------------------------
function generateMeasurementsFromERSCO2Payload(payloadBytes)
    local measurements = {}
    local i = 1
    -- table of functions we should call for eachbyte
    local byteTables = {
        byte1 = { fun = byte1Temp, step = 2 },
        byte2 = { fun = byte2Humidity, step = 1 },
        byte3 = { fun = Addstep, step = 3 },
        byte4 = { fun = byte4Light, step = 2 },
        byte5 = { fun = byte5Motion, step = 1 },
        byte6 = { fun = byte6CO2, step = 2 },
        byte7 = { fun = byte7SOC, step = 2 },
        byte8 = { fun = Addstep, step = 2 },
        byte9 = { fun = Addstep, step = 5 },
        byte10 = { fun = Addstep, step = 2 },
        byte11 = { fun = Addstep, step = 4 },
        byte12 = { fun = Addstep, step = 2 },
        byte13 = { fun = Addstep, step = 1 },
        byte14 = { fun = Addstep, step = 2 },
        byte15 = { fun = Addstep, step = 1 },
        byte16 = { fun = Addstep, step = 4 },
        byte17 = { fun = Addstep, step = 1 },
        byte18 = { fun = Addstep, step = 1 },
        byte19 = { fun = Addstep, step = 64 },
        byte20 = { fun = Addstep, step = 4 },
        byte21 = { fun = Addstep, step = 2 },
        byte22 = { fun = Addstep, step = 2 },
        byte23 = { fun = Addstep, step = 4 },
        byte24 = { fun = Addstep, step = 2 },
        byte25 = { fun = Addstep, step = 2 },
        byte26 = { fun = Addstep, step = 1 },
        byte27 = { fun = Addstep, step = 4 },
        byte28 = { fun = Addstep, step = 2 },
    }
    while i <= #payloadBytes
    do
        local currentByte = payloadBytes[i]

        -- i = currentByte <= 28 and functions[currentByte](i, measurements, payloadBytes, steps[currentByte]) or #payloadBytes
        i = currentByte <= 28 and
            byteTables["byte" .. currentByte]["fun"](i, measurements, payloadBytes,
                byteTables["byte" .. currentByte]["step"]) or #payloadBytes

        i = i + 1
    end

    return measurements
end

function convertHexStringToBytes(hexString)
    local bytes = {}
    if #hexString % 2 ~= 0 then
        return bytes
    end
    for i = 1, #hexString do
        if i % 2 == 1 then
            local currentHexString = hexString:sub(i, i + 1)
            local currentByte = tonumber(currentHexString, 16)
            table.insert(bytes, currentByte)
        end
    end
    return bytes
end

function readFileToBytes(dataFilePath)
    local bytes = {}
    local file = io.open(dataFilePath, "rb")
    if file == nil then
        return bytes
    end
    local contentString = file:read("*all")
    file:close()

    for i = 1, #contentString do
        local character = contentString:sub(i, i)
        table.insert(bytes, string.byte(character))
    end
    return bytes
end

function getPayloadBytes(dataFilePath)
    local bytes = readFileToBytes(dataFilePath)
    local payloadBytes = {}
    for i = 17, #bytes do
        table.insert(payloadBytes, bytes[i])
    end
    return payloadBytes
end

function deleteFile(dataFilePath)
    os.execute('rm -rf "' .. dataFilePath .. '"')
end

function areMeasurementsEqual(firstMeasurement, secondMeasurement)
    if #firstMeasurement ~= 3 or #secondMeasurement ~= 3 then
        return false
    end
    return firstMeasurement[1] == secondMeasurement[1] and
        firstMeasurement[2] == secondMeasurement[2] and
        firstMeasurement[3] == secondMeasurement[3]
end

function filterMeasurements(id, currentMeasurements, lastMeasurementsTable)
    local filteredMeasurements = {}
    local lastMeasurementsForId = lastMeasurementsTable[id]
    for propertyName, measurement in pairs(currentMeasurements) do
        local lastMeasurementForProperty = lastMeasurementsForId[propertyName]
        if lastMeasurementForProperty == nil or not areMeasurementsEqual(measurement, lastMeasurementForProperty) then
            filteredMeasurements[propertyName] = measurement
        end
    end
    return filteredMeasurements
end

function dump(o)
    if type(o) == 'table' then
        local s = '{ '
        for k, v in pairs(o) do
            if type(k) ~= 'number' then
                k = '"' .. k .. '"'
            end
            s = s .. '[' .. k .. '] = ' .. dump(v) .. ','
        end
        return s .. '} '
    else
        return tostring(o)
    end
end

function terminateIfStringIsEmpty(string)
    if #string == 0 then
        logString('an empty string was provided as a parameter to this script')
        os.exit()
    end
    return string
end

function logString(string)
    stringWithDate = os.date("!%c") .. ' - ' .. string
    print(stringWithDate)
    file = io.open('/var/customized_script_output.log', 'a')
    if file == nil then
        return
    end
    file:write(stringWithDate .. '\n')
    file:close()
end

function main()
    local mqttHost = terminateIfStringIsEmpty(getParameterAtIndex(1))
    local mqttPort = terminateIfStringIsEmpty(getParameterAtIndex(2))
    local mqttUser = terminateIfStringIsEmpty(getParameterAtIndex(3))
    local mqttPass = terminateIfStringIsEmpty(getParameterAtIndex(4))
    local checkIntervalSeconds = terminateIfStringIsEmpty(getParameterAtIndex(5))
    --[[
    local mqttHost = 'mqtt.efficientio.io'
    local mqttPort = 8883
    local mqttUser = '907a2b72-b82f-401e-aa63-9360abccb3df'
    local mqttPass = '82b288a3-b047-424e-9f02-613e7328786b'
    local checkIntervalSeconds = 500
]]
    --
    local projectId = mqttUser
    logString('got the following parameters: ' .. dump({ mqttHost, mqttPort, mqttUser, mqttPass, checkIntervalSeconds }))

    local channelDirectory = '/var/iot/channels'
    local customScriptDirectory = '/etc/lora/customized_scripts'

    package.path = package.path .. ';' .. customScriptDirectory .. '/mappings.lua'
    local mappings = require('mappings')
    logString('loaded these mappings: ' .. dump(mappings))

    local lastMeasurementsTable = {}
    for id, _ in pairs(mappings) do
        lastMeasurementsTable[id] = {}
    end

    while true
    do
        local processableIds = listItemsInDirectory(channelDirectory)
        logString('found these incoming messages: ' .. dump(processableIds))
        for _, processableId in pairs(processableIds) do
            local processableIdWithoutIndex = processableId:sub(1,
                string.find(processableId, "-") ~= nil and string.find(processableId, "-") - 1 or #processableId)

            local mapping = mappings[processableIdWithoutIndex]
            if mapping ~= nil then
                logString('found a mapped id: ' .. processableId)
                local baseName, deviceType = mapping[1], mapping[2]
                local filePath = channelDirectory .. '/' .. processableId
                local payloadBytes = getPayloadBytes(filePath)
                logString('got these payload bytes: ' .. dump(payloadBytes))
                local measurements = {}
                if deviceType == 'LSN50v2-D23' then
                    measurements = generateMeasurementsFromLSN50v2D23Payload(payloadBytes)
                elseif deviceType == 'LHT65N' then
                    measurements = generateMeasurementsFromLHT65NPayload(payloadBytes)
                elseif deviceType == 'ERS-CO2' then
                    measurements = generateMeasurementsFromERSCO2Payload(payloadBytes)
                end
                logString('created these measurements : ' .. dump(measurements))
                local filteredMeasurements = filterMeasurements(processableIdWithoutIndex, measurements,
                    lastMeasurementsTable)
                logString('got these new measurements : ' .. dump(filteredMeasurements))
                lastMeasurementsTable[processableIdWithoutIndex] = measurements
                for propertyName, measurement in pairs(filteredMeasurements) do
                    publishMeasurementToMqtt(mqttHost, mqttPort, mqttUser, mqttPass, projectId,
                        baseName .. '.' .. propertyName, measurement[1], measurement[2], measurement[3], 2,
                        customScriptDirectory .. '/certificate.pem')
                end
                deleteFile(filePath)
                logString('deleted the file: ' .. filePath)
            end
        end
        sleepFor(checkIntervalSeconds)
    end
end

main()
