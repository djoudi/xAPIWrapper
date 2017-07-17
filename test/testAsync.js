describe("Asynchronous Testing:", () => {
  const fs = require('fs');

  // Response Types
  const OK = 200;
  const NO_CONTENT = 204;
  const BAD_REQUEST = 400;

  // Testing module functionality
  let should, XAPIWrapper, Util, Statement;

  before(() => {
    // Require necessary modules
    should = require('should');
    XAPIWrapper = require('./../src/xAPIWrapper');
    Util = require('./../src/Utils.js');
    Statement = require('./../src/statement').Statement;

    XAPIWrapper.changeConfig({
      "endpoint": "https://lrs.adlnet.gov/xapi/",
      "user": "aaron",
      "password": "1234",
      "strictCallbacks": true
    });
  });

  describe.only("Statement(s)", () => {
    let s1, s2;

    beforeEach(() => {
      s1 = new Statement({
        'actor': {'mbox':'mailto:userone@example.com'},
        'verb': {'id': 'http://adlnet.gov/expapi/verbs/attempted'},
        'object': {'id': 'http://activity.com/id'}
      });
      s2 = new Statement({
        'actor': {'mbox':'mailto:usertwo@example.com'},
        'verb': {'id': 'http://adlnet.gov/expapi/verbs/attempted'},
        'object': {'id': 'http://activity.com/id'}
      });
    });

    describe.only("PUT", () => {
      it("should pass sending statement asynchronously", async () => {
        let res = await XAPIWrapper.putStatement(s1, s1['id']);
        (res.resp.status).should.eql(NO_CONTENT);
      });
      it("should pass sending statement with callback", (done) => {
        XAPIWrapper.putStatement(s2, s2['id'], (error, resp, data) => {
          if (error) {
            console.log(error);
          } else {
            (resp.status).should.eql(NO_CONTENT);
          }

          done();
        });
      });
      it("should fail sending null statement asynchronously", async () => {
        try {
          let err = await XAPIWrapper.putStatement(null, Util.ruuid());
        } catch (e) {
          (e!==null).should.eql(true);
        }
      });
      it("should fail sending array with callback", (done) => {
        let stmt = [new Statement(s1)];
        XAPIWrapper.putStatement(stmt, stmt['id'], (error, resp, data) => {
          error.should.not.eql(null);
          done();
        });
      });
      it("should fail not using same id as statement", (done) => {
        XAPIWrapper.putStatement([new Statement(s1)], Util.ruuid(), (error, resp, data) => {
          error.should.not.eql(null);
          done();
        });
      });
      describe.skip("With Attachments", () => {
        let stmt;
        let att;

        beforeEach(() => {
          // Get attachment data
          content = fs.readFileSync('test/test.txt').toString();

          att = {
            value: content,
            type: {
              "usageType":"http://adlnet.gov/expapi/attachments/test",
              "display":{"en-US": "Test Attachment"},
              "description":{"en-US":"a test attachment for statement requests"},
              "contentType":"application/octet-stream"
            }
          };

          stmt = new Statement({
            'actor': {'mbox':'mailto:a@example.com'},
            'verb': {'id': 'http://adlnet.gov/expapi/verbs/attempted'},
            'object': {'id': 'http://activity.com/id'}
          });
        });

        it("should pass using valid attachment data asynchronously", async () => {
          let res = await XAPIWrapper.putStatement(stmt, stmt.id, null, [att]);
          (res.resp.status).should.eql(NO_CONTENT);
        });
        it("should pass using valid attachment data with callback", (done) => {
          XAPIWrapper.putStatement(stmt, stmt.id, (error, resp, data) => {
            if (error) {
              console.log(error);
            } else {
              (resp.status).should.eql(NO_CONTENT);
            }

            done();
          }, [att]);
        });
      });
    });
    describe.only("POST", () => {
      it("should pass sending statement asynchronously", async () => {
        let res = await XAPIWrapper.postStatement(s1);
        (res.resp.status).should.eql(OK);
      });
      it("should pass sending statement with callback", (done) => {
        XAPIWrapper.postStatement(s2, (error, resp, data) => {
          (!error).should.eql(true);
          resp.status.should.eql(OK);
          resp.ok.should.eql(true);

          done();
        });
      });
      it("should fail sending null statement asynchronously", async () => {
        try {
          let err = await XAPIWrapper.postStatement(null);
        } catch (e) {
          (e!==null).should.eql(true);
        }
      });
      it("should fail sending array with callback", (done) => {
        XAPIWrapper.postStatement([new Statement(s1)], (error, resp, data) => {
          error.should.not.eql(null);

          done();
        });
      });
      describe.skip("Multiple Statements", () => {
        it("should pass sending statements asynchronously", async () => {
          let stmts=[new Statement(s1), new Statement(s2)];
          let res = await XAPIWrapper.postStatements(stmts);
          (res.resp.status).should.eql(OK);
        });
        it("should pass sending statements with callback", (done) => {
          let stmts = [new Statement(s1)];
          XAPIWrapper.postStatements(stmts, (error, resp, data) => {
            if (error) {
              console.log(error);
            } else {
              (resp.status).should.eql(OK);
            }

            done();
          });
        });
        it("should fail sending single object with callback", (done) => {
          XAPIWrapper.postStatements(new Statement(s1), (error, resp, data) => {
            error.should.not.eql(null);
            done();
          });
        });
        it("should fail sending empty array with callback", (done) => {
          XAPIWrapper.postStatements([], (error, resp, data) => {
            error.should.not.eql(null);
            done();
          });
        });
      });
      describe.skip("With Attachments", () => {
        let stmt;
        let att;

        beforeEach(() => {
          // Get attachment data
          content = fs.readFileSync('test/test.txt').toString();

          att = {
            value: content,
            type: {
              "usageType":"http://adlnet.gov/expapi/attachments/test",
              "display":{"en-US": "Test Attachment"},
              "description":{"en-US":"a test attachment for statement requests"},
              "contentType":"application/octet-stream"
            }
          };

          stmt = new Statement({
            'actor': {'mbox':'mailto:a@example.com'},
            'verb': {'id': 'http://adlnet.gov/expapi/verbs/attempted'},
            'object': {'id': 'http://activity.com/id'}
          });
        });

        it("should pass using valid attachment data asynchronously", async () => {
          let res = await XAPIWrapper.postStatement(stmt, null, [att]);
          (res.resp.status).should.eql(OK);
        });
        it("should pass using valid attachment data with callback", (done) => {
          XAPIWrapper.postStatement(stmt, (error, resp, data) => {
            if (error) {
              console.log(error);
            } else {
              (resp.status).should.eql(OK);
            }

            done();
          }, [att]);
        });
      });
    });
    describe("GET", () => {
      it("should return list of statements asynchronously", async () => {
        let res = await XAPIWrapper.getStatements();
        (res.resp.status==OK && res.data!=null).should.eql(true);
      });
      it("should return list of statements with callback", (done) => {
        XAPIWrapper.getStatements(null, null, (error, resp, data) => {
          if (error) {
            console.log(error);
          } else {
            (resp.status==OK && data!=null).should.eql(true);
          }

          done();
        });
      });
      it("should return single statement asynchronously", async () => {
        let res = await XAPIWrapper.getStatements({"limit":1});
        (res.resp.status==OK && res.data!=null).should.eql(true);
      });
      it("should return single statement using id asynchronously", async () => {
        let id = '39d1c0bd-21b8-4523-b628-1c503cfb1732';
        let res = await XAPIWrapper.getStatements({"statementId":id});
        (JSON.parse(res.data).id).should.eql(id);
      });
      describe("More Statements", () => {

      });
    });
  });

  describe("State", () => {
    let actId, agent, stateId, stateVal;

    before(() => {
      actId = 'http://adlnet.gov/expapi/activities/attempted';
      agent = {'mbox':'mailto:a@example.com'};
      stateId = 'attemptedstate';
      stateVal = {'info': 'the state info'};
    });

    describe("PUT", () => {
      it("should pass sending state using matchHash asynchronously", async () => {
        let res = await XAPIWrapper.putState(actId, agent, stateId, null, stateVal, "*");
        (res.resp.status).should.eql(NO_CONTENT);
      });
      it("should pass sending state using matchHash with callback", (done) => {
        XAPIWrapper.putState(actId, agent, stateId, null, stateVal, "*", (error, resp, data) => {
          if (error) {
            console.log(error);
          } else {
            (resp.status).should.eql(NO_CONTENT);
          }

          done();
        });
      });
      it("should pass sending state using registrationId/matchHash with callback", (done) => {
        let newState = 'registeredstate';
        let id = Util.ruuid();
        XAPIWrapper.putState(actId, agent, newState, id, stateVal, "*", (error, resp, data) => {
          if (error) {
            console.log(error);
          } else {
            (resp.status).should.eql(NO_CONTENT);
          }

          done();
        });
      });
      it("should pass sending state using null matchHash asynchronously", async () => {
        let res = await XAPIWrapper.putState(actId, agent, stateId, null, stateVal, null);
        (res.resp.status).should.eql(NO_CONTENT);
      });
      it("should pass updating state asynchronously", async () => {
        let newState = {'info': 'the new updated state info'};
        let res = await XAPIWrapper.putState(actId, agent, stateId, null, newState, XAPIWrapper.hash(JSON.stringify(stateVal)));
        (res.resp.status).should.eql(NO_CONTENT);
      });
      it("should fail sending null stateval parameter asynchronously", async () => {
        try {
          let res = await XAPIWrapper.putState(actId, agent, stateId, null, "*", null);
        } catch (e) {
          (e).should.not.eql(null);
        }
      });
    });
    describe("POST", () => {
      it("should pass sending state asynchronously", async () => {
        let res = await XAPIWrapper.postState('http://adlnet.gov/expapi/activities/updated', agent, stateId, null, stateVal);
        (res.resp.status).should.eql(NO_CONTENT);
      });
      it("should pass sending state with callback", (done) => {
        XAPIWrapper.postState('http://adlnet.gov/expapi/activities/updated', agent, stateId, null, stateVal, (error, resp, data) => {
          if (error) {
            console.log(error);
          } else {
            (resp.status).should.eql(NO_CONTENT);
          }

          done();
        });
      });
      it("should pass sending state using registration id with callback", (done) => {
        let newState = 'registeredstate';
        let id = Util.ruuid();
        XAPIWrapper.postState(actId, agent, newState, id, stateVal, (error, resp, data) => {
          if (error) {
            console.log(error);
          } else {
            (resp.status).should.eql(NO_CONTENT);
          }

          done();
        });
      });
      it("should fail sending null stateval parameter asynchronously", async () => {
        try {
          let res = await XAPIWrapper.postState(actId, agent, stateId, null, null);
        } catch (e) {
          (e).should.not.eql(null);
        }
      });
    });
    describe("GET", () => {
      it("should return list of state id's using activity/agent asynchronously", async () => {
        let res = await XAPIWrapper.getState(actId, agent);
        (res.resp.status==OK && res.data!=null).should.eql(true);
      });
      it("should return list of state id's using activity/agent with callback", (done) => {
        XAPIWrapper.getState(actId, agent, null, null, null, (error, resp, data) => {
          if (error) {
            console.log(error);
          } else {
            (resp.status==OK && data!=null).should.eql(true);
          }

          done();
        });
      });
      it("should return list of state id's using different agent asynchronously", async () => {
        let res = await XAPIWrapper.getState(actId, {'mbox':'mailto:aaron@example.com'});
        (res.resp.status==OK && res.data!=null).should.eql(true);
      });
      it("should return list of state id's using since parameter asynchronously", async () => {
        let date = "2017-06-26T11:45:28.297971+00:00";
        let res = await XAPIWrapper.getState(actId, agent, null, null, date);
        (res.resp.status==OK && res.data!=null).should.eql(true);
      });
      it("should return empty list using present since parameter asynchronously", async () => {
        let date = (new Date()).toISOString();
        let res = await XAPIWrapper.getState(actId, agent, null, null, date);
        (res.resp.status==OK && res.data!=null).should.eql(true);
      });
      it("should return list of state id's using since parameter with callback", (done) => {
        let date = "2017-06-26T11:45:28.297971+00:00";
        XAPIWrapper.getState(actId, agent, null, null, date, (error, resp, data) => {
          if (error) {
            console.log(error);
          } else {
            (resp.status==OK && data!=null).should.eql(true);
          }

          done();
        });
      });
      it("should return single state using state id parameter asynchronously", async () => {
        let post = await XAPIWrapper.postState('http://adlnet.gov/expapi/activities/tested', agent, "testedstate", null, stateVal);

        let res = await XAPIWrapper.getState('http://adlnet.gov/expapi/activities/tested', agent, "testedstate");
        (res.resp.status==OK && res.data!=null).should.eql(true);
      });
      it("should fail using invalid activity id or agent asynchronously", async () => {
        try {
          let res = await XAPIWrapper.getState(actId);
        } catch (e) {
          (e).should.not.eql(null);
        }
      });
    });
    describe("DELETE", () => {
      it("should delete specified state using activityId/agent parameters asynchronously", async () => {
        let res = await XAPIWrapper.deleteState('http://adlnet.gov/expapi/activities/updated', agent);
        (res.resp.status).should.eql(NO_CONTENT);
      });
      it("should delete specified state using activityId/agent parameters with callback", (done) => {
        XAPIWrapper.deleteState('http://adlnet.gov/expapi/activities/completed', agent, 'completedstate', null, (error, resp, data) => {
          if (error) {
            console.log(error);
          } else {
            (resp.status).should.eql(NO_CONTENT);
          }

          done();
        });
      });
      it("should delete specified state using activityId/agent parameters with callback", (done) => {
        XAPIWrapper.deleteState('http://adlnet.gov/expapi/activities/launched', agent, null, null, (error, resp, data) => {
          if (error) {
            console.log(error);
          } else {
            (resp.status).should.eql(NO_CONTENT);
          }

          done();
        });
      });
      it("should delete specified state using state id parameter asynchronously", async () => {
        let post = await XAPIWrapper.postState('http://adlnet.gov/expapi/activities/updated', agent, 'updatedstate', null, stateVal);

        let res = await XAPIWrapper.deleteState('http://adlnet.gov/expapi/activities/updated', agent, 'updatedstate');
        (res.resp.status).should.eql(NO_CONTENT);
      });
      it("should delete specified state using registration id parameter asynchronously", async () => {
        let id = Util.ruuid();
        let post = await XAPIWrapper.postState('http://adlnet.gov/expapi/activities/updated', agent, 'updatedstate', id, stateVal);

        let res = await XAPIWrapper.deleteState('http://adlnet.gov/expapi/activities/updated', agent, null, id);
        (res.resp.status).should.eql(NO_CONTENT);
      });
      it("should fail using invalid activity id or agent parameters asynchronously", async () => {
        try {
          let res = await XAPIWrapper.deleteState(null, agent);
        } catch (e) {
          (e).should.not.eql(null);
        }
      });
    });
  });

  describe("Activities", () => {
    it("should return activity object asynchronously", async () => {
      let res = await XAPIWrapper.getActivities('http://adlnet.gov/expapi/activities/attempted');
      (res.resp.status).should.eql(OK);
    });
  });

  describe("Activity Profile", () => {
    let actId, profileVal;

    before(() => {
      actId = 'http://adlnet.gov/expapi/activities/attempted';
      profileVal = {'info': 'the profile info'};
    });

    describe("POST", () => {
      it("should pass sending activity profile asynchronously", async () => {
        let res = await XAPIWrapper.postActivityProfile(actId, 'attemptprofile', profileVal);
        (res.resp.status).should.eql(NO_CONTENT);
      });
      it("should pass sending activity profile with callback", (done) => {

      });
    });
  });

  describe("Agents", () => {
    it("should return Person object asynchronously", async () => {
      let res = await XAPIWrapper.getAgents({'mbox':'mailto:a@example.com'});
      (res.resp.status).should.eql(OK);
    });
    it("should return Person object with callback", (done) => {
      XAPIWrapper.getAgents({'mbox':'mailto:a@example.com'}, (error, resp, data) => {
        if (error) {
          console.log(error);
        } else {
          (resp.status).should.eql(OK);
        }

        done();
      });
    });
    it("should fail using invalid agent asynchronously", async () => {
      let res = await XAPIWrapper.getAgents({'mbox':'mailto:wrong@example.com'});
      (res.resp.status).should.not.eql(OK);
    });
    it("should fail using null agent parameter asynchronously", async () => {
      try {
        let res = await XAPIWrapper.getAgents(null);
      } catch (e) {
        (e).should.not.eql(null);
      }
    });
  });

  describe("Agent Profile", () => {
    describe("PUT", () => {
      it("should pass using valid async/await", async () => {

      });
      it("should pass using valid callback", (done) => {

      });
    });
    describe("POST", () => {
      it("should pass using valid async/await", async () => {

      });
      it("should pass using valid callback", (done) => {

      });
    });
  });

});
