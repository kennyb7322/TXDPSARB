import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';

export interface IArbWebPartProps {
  formUrl: string;
  title: string;
}

export default class ArbWebPart extends BaseClientSideWebPart<IArbWebPartProps> {

  public render(): void {
    // Get the form URL, default to relative path if not configured
    const formUrl = this.properties.formUrl || 
                    `${this.context.pageContext.web.absoluteUrl}/SiteAssets/ARBForm/index.html`;

    this.domElement.innerHTML = `
      <div class="arb-webpart">
        <style>
          .arb-webpart {
            width: 100%;
            height: 100%;
            min-height: 800px;
          }
          .arb-webpart .webpart-header {
            padding: 20px;
            background-color: #003f87;
            color: white;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 0;
          }
          .arb-webpart iframe {
            width: 100%;
            height: calc(100vh - 200px);
            min-height: 800px;
            border: none;
            display: block;
          }
          .arb-webpart .error-message {
            padding: 20px;
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
            margin: 20px;
          }
        </style>
        <div class="webpart-header">
          ${escape(this.properties.title || 'TXDPS ARB Submission Form')}
        </div>
        <iframe 
          src="${escape(formUrl)}" 
          title="ARB Submission Form"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          loading="lazy"
          onload="this.style.display='block';"
          onerror="this.style.display='none'; document.querySelector('.error-message').style.display='block';"
        ></iframe>
        <div class="error-message" style="display: none;">
          <strong>Error:</strong> Unable to load the ARB form. Please check the form URL configuration.
        </div>
      </div>
    `;
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: 'Configure the ARB Form Web Part'
          },
          groups: [
            {
              groupName: 'Display Settings',
              groupFields: [
                PropertyPaneTextField('title', {
                  label: 'Web Part Title',
                  description: 'Title displayed at the top of the web part'
                }),
                PropertyPaneTextField('formUrl', {
                  label: 'Form URL',
                  description: 'Full URL to the ARB form (leave empty to use default location)',
                  placeholder: 'https://tenant.sharepoint.com/sites/ARB/SiteAssets/ARBForm/index.html'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
