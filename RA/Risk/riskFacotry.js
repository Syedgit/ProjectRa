angular
		.module('riskAssessmentApp')
		.factory(
				'riskFactory',
				function($http) {
					'use strict';

					/*
					 * Save risk
					 *
					 * "longNm":"Risk6",
					 * "rskStmTx":"Risk6",
					 * "riskFrameworkCategoryKey":"1",
					 * "riskCausalComments":"Risk6",
					 * "riskImpactComments":"Risk6",
					 * "rskImpactCtgyToRiskKyList":["3"],
					 * "rskCausCtgyToRiskKyList":[14004],
					 * "erhKey":20575,
					 * "riskEventCategoryKey":10034
					 */
					var serializeRisk = function(risk) {
						var objToReturn = {
						    longNm : risk.longNm,
						    rskStmTx : risk.rskStmTx,
						    riskEventCategoryKey : risk.riskEventCategoryKey[0].id,
							riskFrameworkCategoryKey : risk.riskFrameworkCategoryKey,
							erhKey : risk.erhKey[0].id,
							riskCausalComments : risk.riskCausalComments,
							riskImpactComments : risk.riskImpactComments,
							rskImpactCtgyToRiskKyList : [],
							rskCausCtgyToRiskKyList: []
						};
						// set primary key based on Save or Update
						if (risk.rskKy) {
							objToReturn.rskKy = risk.rskKy;
						}

						risk.rskCausCtgyToRiskKyList.forEach(function(obj) {
							objToReturn.rskCausCtgyToRiskKyList.push(obj.id);
						});
						risk.rskImpactCtgyToRiskKyList.forEach(function(obj) {
							objToReturn.rskImpactCtgyToRiskKyList.push(obj.id);
						});
						
						if (risk.userReferenceId) {
							objToReturn.userReferenceId = risk.userReferenceId;
						}

						return objToReturn;
					};
					var serializeRiskInProcess = function(riskInProcess) {
						var objToReturn = {
							justification : riskInProcess.justification,
							prcsKy : riskInProcess.prcsKy,
							geographicLocationKeyList : []
						};
						// set primary key based on Save or Update
						if (riskInProcess.riskInProcessKy) {
							objToReturn.riskInProcessKy = riskInProcess.riskInProcessKy;
						}

						if (riskInProcess.rskKy) {
							objToReturn.rskKy = riskInProcess.rskKy;
						}
						riskInProcess.geographicLocationKeyList.forEach(function(obj) {
							objToReturn.geographicLocationKeyList.push(obj.id);
						});

						return objToReturn;
					};
					return {
						saveRisk : function(risk) {
							var request = serializeRisk(risk);
							console.log('request payload', JSON
									.stringify(request));
							var endpoint = 'app/risk/rest/risk';
							return $http.post(endpoint, request);
						},
						saveRiskInProcess : function(risk) {
							var request = serializeRisk(risk);
							request.riskInProcessDTO = serializeRiskInProcess(risk.riskInProcessDTO);
							console.log('request payload', JSON
									.stringify(request));
							var endpoint = 'app/risk/rest/riskTocontrol/saveCreateAndAlignNewRiskToProcess';
							return $http.post(endpoint, request);
						}
					};
				});