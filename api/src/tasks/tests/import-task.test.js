describe('import-task', () => {
  describe('protectedCreateTask', () => {
    let mockTaskAuditRecord;
    let importTask;

    beforeEach(() => {
      // mock query-actions sendResponse to return whatever is passed to it
      const mockSendResponse = jest.fn(input => {
        return Promise.resolve(input);
      });
      const queryActions = require('../../utils/query-actions');
      queryActions.sendResponse = mockSendResponse;

      // mock task-audit-record class
      mockTaskAuditRecord = require('../../utils/task-audit-record');
      jest.mock('../../utils/task-audit-record');

      // require this AFTER its require-mocks have been setup
      importTask = require('../import-task');
    });

    it('throws an error if required task param is missing', async () => {
      const mockArgs = {
        swagger: {
          params: {
            auth_payload: {
              realm_access: {
                roles: 'roles'
              }
            },
            task: null
          }
        }
      };

      await expect(importTask.protectedCreateTask(mockArgs, {})).rejects.toThrow(
        new Error('protectedCreateTask - missing required request body')
      );
    });

    it('throws an error if required task.value param is missing', async () => {
      const mockArgs = {
        swagger: {
          params: {
            auth_payload: {
              realm_access: {
                roles: 'roles'
              }
            },
            task: {
              value: null
            }
          }
        }
      };

      await expect(importTask.protectedCreateTask(mockArgs, {})).rejects.toThrow(
        new Error('protectedCreateTask - missing required request body')
      );
    });

    it('throws an error if required dataSourceType param is missing', async () => {
      const mockArgs = {
        swagger: {
          params: {
            auth_payload: {
              realm_access: {
                roles: 'roles'
              }
            },
            task: {
              value: {
                // dataSourceType: 'epic',
                recordType: 'order'
              }
            }
          }
        }
      };

      await expect(importTask.protectedCreateTask(mockArgs, {})).rejects.toThrow(
        new Error('protectedCreateTask - missing required dataSourceType')
      );
    });

    // it('throws an error if required dataSourceType param is missing', async () => {
    //   const mockArgs = {
    //     swagger: {
    //       params: {
    //         auth_payload: {
    //           realm_access: {
    //             roles: 'roles'
    //           }
    //         },
    //         task: {
    //           value: {
    //             dataSourceType: 'epic',
    //             recordType: null
    //           }
    //         }
    //       }
    //     }
    //   };

    //   await expect(importTask.protectedCreateTask(mockArgs, {})).rejects.toThrow(
    //     new Error('protectedCreateTask - missing required recordType')
    //   );
    // });

    // it('throws an error if required dataSourceType param is missing', async () => {
    //   const mockArgs = {
    //     swagger: {
    //       params: {
    //         auth_payload: {
    //           realm_access: {
    //             roles: 'roles'
    //           }
    //         },
    //         task: {
    //           value: {
    //             dataSourceType: 'epic',
    //             recordType: null
    //           }
    //         }
    //       }
    //     }
    //   };

    //   await expect(importTask.protectedCreateTask(mockArgs, {})).rejects.toThrow(
    //     new Error('protectedCreateTask - missing required recordType')
    //   );
    // });

    // it('throws an error if no matching dataSource is found', async () => {
    //   const mockArgs = {
    //     swagger: {
    //       params: {
    //         auth_payload: {
    //           realm_access: {
    //             roles: 'roles'
    //           }
    //         },
    //         task: {
    //           value: {
    //             dataSourceType: 'notAValidType',
    //             recordType: 'order'
    //           }
    //         }
    //       }
    //     }
    //   };

    //   await importTask.protectedCreateTask(mockArgs, {});

    //   expect(mockTaskAuditRecord).toHaveBeenCalledTimes(1);

    //   // get the first instance of this class and check it was called
    //   expect(mockTaskAuditRecord.mock.instances[0].updateTaskRecord).toHaveBeenCalledWith({
    //     status: 'Error',
    //     finishDate: expect.any(Date)
    //   });
    // });
  });
});
