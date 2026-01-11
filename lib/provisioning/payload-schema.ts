/**
 * Provisioning Payload Schema
 * JSON Schema for validation and documentation
 */

export const PROVISIONING_PAYLOAD_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: [
    'locationId',
    'locationName',
    'accountId',
    'accountName',
    'timestamp',
    'version',
    'location',
    'contacts',
    'phoneSystem',
    'devices',
    'users',
    'extensions',
    'workingHours',
    'callFlow',
    'metadata',
  ],
  properties: {
    locationId: { type: 'string' },
    locationName: { type: 'string' },
    accountId: { type: 'string' },
    accountName: { type: 'string' },
    timestamp: { type: 'string', format: 'date-time' },
    version: { type: 'string' },
    location: {
      type: 'object',
      required: ['name', 'address'],
      properties: {
        name: { type: 'string' },
        address: {
          type: 'object',
          required: ['line1', 'city', 'state', 'zipcode'],
          properties: {
            line1: { type: 'string' },
            line2: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            zipcode: { type: 'string' },
          },
        },
      },
    },
    contacts: {
      type: 'object',
      required: ['primary'],
      properties: {
        primary: {
          type: 'object',
          required: ['name', 'email', 'phone'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            preferredContactMedium: { type: 'string' },
          },
        },
      },
    },
    phoneSystem: {
      type: 'object',
      required: ['type', 'fax'],
      properties: {
        type: { type: 'string', enum: ['TRADITIONAL', 'VOIP'] },
        details: { type: 'string' },
        voipProvider: { type: 'string' },
        callForwardingSupported: { type: 'boolean' },
        fax: {
          type: 'object',
          required: ['usesFax'],
          properties: {
            usesFax: { type: 'boolean' },
            faxNumber: { type: 'string' },
            wantsFaxInVoiceStack: { type: 'boolean' },
          },
        },
      },
    },
    devices: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'brand', 'model', 'ownership', 'assignmentType'],
        properties: {
          id: { type: 'string' },
          brand: { type: 'string' },
          model: { type: 'string' },
          ownership: { type: 'string', enum: ['OWNED', 'LEASED'] },
          assignmentType: { type: 'string' },
          macAddress: { type: 'string' },
          serialNumber: { type: 'string' },
          extension: { type: 'string' },
          assignedUser: {
            type: 'object',
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' },
            },
          },
        },
      },
    },
    users: {
      type: 'array',
      items: {
        type: 'object',
        required: ['firstName', 'lastName', 'email'],
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          extension: { type: 'string' },
        },
      },
    },
    extensions: {
      type: 'array',
      items: {
        type: 'object',
        required: ['extension', 'assignedTo'],
        properties: {
          extension: { type: 'string' },
          assignedTo: { type: 'string', enum: ['user', 'device', 'common'] },
          userId: { type: 'string' },
          deviceId: { type: 'string' },
        },
      },
    },
    workingHours: {
      type: 'array',
      items: {
        type: 'object',
        required: ['day', 'isOpen'],
        properties: {
          day: { type: 'string' },
          isOpen: { type: 'boolean' },
          openTime: { type: 'string' },
          closeTime: { type: 'string' },
        },
      },
    },
    callFlow: {
      type: 'object',
      required: ['hasIVR', 'voicemail'],
      properties: {
        greetingMessage: { type: 'string' },
        hasIVR: { type: 'boolean' },
        ivr: {
          type: 'object',
          properties: {
            options: {
              type: 'array',
              items: {
                type: 'object',
                required: ['optionNumber', 'script', 'ringType', 'targets'],
                properties: {
                  optionNumber: { type: 'string' },
                  script: { type: 'string' },
                  ringType: { type: 'string', enum: ['users', 'extensions'] },
                  targets: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        userId: { type: 'string' },
                        extension: { type: 'string' },
                      },
                    },
                  },
                  retryAttempts: { type: 'number' },
                  waitTime: { type: 'number' },
                  invalidSelectionScript: { type: 'string' },
                  afterRetriesTarget: { type: 'string' },
                  voicemailScript: { type: 'string' },
                },
              },
            },
          },
        },
        directRouting: {
          type: 'object',
          properties: {
            ringType: { type: 'string', enum: ['users', 'extensions'] },
            targets: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  extension: { type: 'string' },
                },
              },
            },
          },
        },
        voicemail: {
          type: 'object',
          properties: {
            script: { type: 'string' },
            sharedUsers: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
    metadata: {
      type: 'object',
      properties: {
        practiceManagementSoftware: { type: 'string' },
        totalDevices: { type: 'number' },
        assignmentStrategy: { type: 'string' },
        submittedAt: { type: 'string', format: 'date-time' },
        generatedAt: { type: 'string', format: 'date-time' },
      },
    },
  },
};
