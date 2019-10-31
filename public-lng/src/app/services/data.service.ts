import { Injectable } from '@angular/core';

import home from '../../assets/data/general/home.json';

import project1Overview from '../../assets/data/project1/overview.json';
import project1Background from '../../assets/data/project1/background.json';
import project1Authorizations from '../../assets/data/project1/authorizations.json';
import project1Compliance from '../../assets/data/project1/compliance.json';
import project1Plans from '../../assets/data/project1/plans.json';
import project1Nations from '../../assets/data/project1/nations.json';

import project2Overview from '../../assets/data/project2/overview.json';
import project2Background from '../../assets/data/project2/background.json';
import project2Authorizations from '../../assets/data/project2/authorizations.json';
import project2Compliance from '../../assets/data/project2/compliance.json';
import project2Plans from '../../assets/data/project2/plans.json';
import project2Nations from '../../assets/data/project2/nations.json';

import { PageTypes } from 'app/utils/page-types.enum.js';

// general site data
const generalData = {
  home: home
};

// project specific data
const projectData = {
  1: {
    overview: project1Overview,
    background: project1Background,
    authorizations: project1Authorizations,
    compliance: project1Compliance,
    plans: project1Plans,
    nations: project1Nations
  },
  2: {
    overview: project2Overview,
    background: project2Background,
    authorizations: project2Authorizations,
    compliance: project2Compliance,
    plans: project2Plans,
    nations: project2Nations
  }
};

/**
 * Provides getters for the properties of the assets/data/ files.
 *
 * @export
 * @class DataService
 */
@Injectable()
export class DataService {
  constructor() {}

  // general site data

  getHome() {
    return generalData.home;
  }

  // project specific data

  getText(id: number, pageType: PageTypes) {
    if (!id || !pageType) {
      return;
    }

    return projectData[id][pageType.toString()].text;
  }

  getDetails(id: number, pageType: PageTypes) {
    if (!id || !pageType) {
      return;
    }

    return projectData[id][pageType.toString()].details;
  }

  getImages(id: number, pageType: PageTypes) {
    if (!id || !pageType) {
      return;
    }

    return projectData[id][pageType.toString()].images;
  }

  getDocumentHeaders(id: number, pageType: PageTypes) {
    if (!id || !pageType) {
      return;
    }

    return projectData[id][pageType.toString()].documents.headers;
  }

  getDocumentFilters(id: number, pageType: PageTypes) {
    if (!id || !pageType) {
      return;
    }

    return projectData[id][pageType.toString()].documents.filters;
  }

  getDocuments(id: number, pageType: PageTypes) {
    if (!id || !pageType) {
      return;
    }

    return projectData[id][pageType.toString()].documents.docs;
  }

  getActivities(id: number, pageType: PageTypes) {
    if (!id || !pageType) {
      return;
    }

    return projectData[id][pageType.toString()].activities;
  }
}
