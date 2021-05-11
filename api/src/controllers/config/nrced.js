const mongoose = require('mongoose');
const { configData: ConfigData } = require('../../models/index');
const utils = require('../../utils/constants/misc');
const ConfigConsts = require('../../utils/constants/config');

exports.CreateNRCEDConfig = async function (data, author) {
    let configData = new ConfigData();
    configData._schemaName = 'ConfigData';
    configData.configApplication = ConfigConsts.CONFIG_APPS.NRCED;
    configData.data = {};
    configData.addedBy = author;
    configData.dateAdded = new Date();

    // TODO: Allow for configuration for params.
    configData.write = [utils.ApplicationRoles.ADMIN_NRCED, utils.ApplicationRoles.ADMIN];
    configData.read = utils.ApplicationAdminRoles;
    configData.read.push('public');

    configData.configType = data.configType;
    let comPackageData = {};
    switch (data.configType) {
        case ConfigConsts.CONFIG_TYPES.communicationPackage:
            // Data fields: title, description, startDate, endDate, additionalInfo
            // Required fields: title, description
            if (data.title) {
                comPackageData['title'] = data.title;
            } else {
                throw 'You must include a title in data.'
            }
            if (data.description) {
                comPackageData['description'] = data.description;
            } else {
                throw 'You must include a description in data for configType communicationPackage.'
            }

            // These fields are not manditory
            try {
                if (!data.startDate) throw 'startDate is null or undefined.';
                comPackageData['startDate'] = new Date(data.startDate);
            } catch (error) {
                comPackageData['startDate'] = null;
            }
            try {
                if (!data.endDate) throw 'endDate is null or undefined.';
                comPackageData['endDate'] = new Date(data.endDate);
            } catch (error) {
                comPackageData['endDate'] = null;
            }

            comPackageData['additionalInfo'] = data.additionalInfo ? data.additionalInfo : null;

            configData.data = comPackageData;
            break;
        default:
            throw 'You must provide a valid configType';
    }
    return await configData.save();
}

exports.EditNRCEDConfig = async function (_id, data, author) {
    let configData = {};
    configData['dateUpdated'] = new Date();
    configData['updatedBy'] = author;

    let comData = {};
    switch (data.configType) {
        case ConfigConsts.CONFIG_TYPES.communicationPackage:
            if (data.title) {
                comData['title'] = data.title;
            }
            if (data.description) {
                comData['description'] = data.description;
            }
            if (data.startDate) {
                try {
                    if (!data.startDate) throw 'startDate is null or undefined.';
                    comData['startDate'] = new Date(data.startDate);
                } catch (error) {
                    break;
                }
            }
            if (data.endDate) {
                try {
                    if (!data.endDate) throw 'endDate is null or undefined.';
                    comData['endDate'] = new Date(data.endDate);
                } catch (error) {
                    break;
                }
            }
            if (data.additionalInfo) {
                comData['additionalInfo'] = data.additionalInfo;
            }
            configData['data'] = comData;
            break;
        default:
            throw 'You must provide a valid configType';
    }

    const ConfigData = mongoose.model('ConfigData');
    return await ConfigData.findOneAndUpdate(
        { _id: _id },
        configData
    );
}