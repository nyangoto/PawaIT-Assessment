// Kenya Tax Knowledge Graph Schema

// Node Labels with Properties
CREATE 
  (l:NodeLabel {name: 'Document', properties: ['id', 'title', 'publicationDate', 'effectiveDate', 'documentType', 'documentStatus']}),
  (l:NodeLabel {name: 'TaxLegislation', properties: ['id', 'title', 'effectiveDate', 'amendmentHistory']}),
  (l:NodeLabel {name: 'TaxConcept', properties: ['name', 'definition', 'scope', 'applicability']}),
  (l:NodeLabel {name: 'Guide', properties: ['id', 'title', 'targetAudience', 'publicationDate', 'version']}),
  (l:NodeLabel {name: 'Procedure', properties: ['name', 'steps', 'requiredDocuments', 'estimatedTime']}),
  (l:NodeLabel {name: 'Form', properties: ['formNumber', 'name', 'filingFrequency', 'filingDeadline']}),
  (l:NodeLabel {name: 'ComplianceObligation', properties: ['name', 'description', 'frequency', 'penalty']}),
  (l:NodeLabel {name: 'TaxpayerType', properties: ['name', 'definition', 'registrationRequirements']}),
  (l:NodeLabel {name: 'TaxObligation', properties: ['name', 'description', 'filingRequirements']}),
  (l:NodeLabel {name: 'TaxRate', properties: ['value', 'effectiveDate', 'expiryDate', 'applicableScenarios']}),
  (l:NodeLabel {name: 'Timeline', properties: ['deadline', 'period', 'frequency', 'graceperiod']}),
  (l:NodeLabel {name: 'Date', properties: ['value', 'description']}),
  (l:NodeLabel {name: 'BusinessSector', properties: ['name', 'description', 'nacesCode']}),
  (l:NodeLabel {name: 'TaxExemption', properties: ['name', 'description', 'conditions', 'legalBasis']}),
  (l:NodeLabel {name: 'System', properties: ['name', 'version', 'requirements', 'supportContact']}),
  (l:NodeLabel {name: 'ComplianceFailure', properties: ['type', 'description', 'frequentCauses']}),
  (l:NodeLabel {name: 'Penalty', properties: ['amount', 'rate', 'calculationMethod', 'appealProcedure']}),
  (l:NodeLabel {name: 'TaxAuthority', properties: ['name', 'jurisdiction', 'contactInformation']}),
  (l:NodeLabel {name: 'Example', properties: ['scenario', 'calculation', 'outcome', 'applicableTo']}),
  (l:NodeLabel {name: 'Appeal', properties: ['grounds', 'process', 'timeframe', 'requiredEvidence']}),
  (l:NodeLabel {name: 'Decision', properties: ['type', 'issuingAuthority', 'basis', 'implications']}),
  (l:NodeLabel {name: 'Documentation', properties: ['type', 'requiredContent', 'retentionPeriod']}),
  (l:NodeLabel {name: 'ThresholdValue', properties: ['amount', 'applicability', 'consequence', 'reviewFrequency']}),
  (l:NodeLabel {name: 'GeographicArea', properties: ['name', 'type', 'boundaries', 'governingAuthority']}),
  (l:NodeLabel {name: 'TaxRegime', properties: ['name', 'applicableLaws', 'benefits', 'qualifyingCriteria']});

// Relationship Types
CREATE
  // Pattern 1: Legislation Defines Tax Concepts
  (r:RelationshipType {name: 'DEFINES', source: 'TaxLegislation', target: 'TaxConcept', properties: ['section', 'legalContext']}),
  
  // Pattern 2: Document References Document
  (r:RelationshipType {name: 'REFERENCES', source: 'Document', target: 'Document', properties: ['context', 'purpose']}),
  
  // Pattern 3: Document Amends Document
  (r:RelationshipType {name: 'AMENDS', source: 'Document', target: 'Document', properties: ['amendmentDate', 'effectiveDate', 'changedSections']}),
  
  // Pattern 4: Guide Explains Legislation
  (r:RelationshipType {name: 'EXPLAINS', source: 'Guide', target: 'TaxLegislation', properties: ['clarity', 'comprehensiveness', 'examples']}),
  
  // Pattern 5: Procedure Implements Concept
  (r:RelationshipType {name: 'IMPLEMENTS', source: 'Procedure', target: 'TaxConcept', properties: ['method', 'effectiveness']}),
  
  // Pattern 6: Form RequiredFor Compliance
  (r:RelationshipType {name: 'REQUIRED_FOR', source: 'Form', target: 'ComplianceObligation', properties: ['mandatoryFields', 'submissionMethod']}),
  
  // Pattern 7: TaxpayerType SubjectTo Obligation
  (r:RelationshipType {name: 'SUBJECT_TO', source: 'TaxpayerType', target: 'TaxObligation', properties: ['conditions', 'exceptions']}),
  
  // Pattern 8: TaxConcept HasRate TaxRate
  (r:RelationshipType {name: 'HAS_RATE', source: 'TaxConcept', target: 'TaxRate', properties: ['applicableFrom', 'applicableTo', 'conditions']}),
  
  // Pattern 9: Procedure RequiredFor Compliance
  (r:RelationshipType {name: 'REQUIRED_FOR', source: 'Procedure', target: 'ComplianceObligation', properties: ['mandatorySteps', 'alternativeProcedures']}),
  
  // Pattern 10: TaxConcept HasDeadline Timeline
  (r:RelationshipType {name: 'HAS_DEADLINE', source: 'TaxConcept', target: 'Timeline', properties: ['consequence', 'extensions']}),
  
  // Pattern 11: Document IsEffectiveFrom Date
  (r:RelationshipType {name: 'IS_EFFECTIVE_FROM', source: 'Document', target: 'Date', properties: ['gazette', 'announcement']}),
  
  // Pattern 12: TaxConcept AppliesTo BusinessSector
  (r:RelationshipType {name: 'APPLIES_TO', source: 'TaxConcept', target: 'BusinessSector', properties: ['specialProvisions', 'industrySpecificRules']}),
  
  // Pattern 13: TaxExemption Exempts TaxpayerType
  (r:RelationshipType {name: 'EXEMPTS', source: 'TaxExemption', target: 'TaxpayerType', properties: ['conditions', 'documentation', 'limitations']}),
  
  // Pattern 14: Form FiledVia System
  (r:RelationshipType {name: 'FILED_VIA', source: 'Form', target: 'System', properties: ['requirements', 'alternativeMethods', 'technicalSteps']}),
  
  // Pattern 15: ComplianceFailure ResultsIn Penalty
  (r:RelationshipType {name: 'RESULTS_IN', source: 'ComplianceFailure', target: 'Penalty', properties: ['severity', 'waiver_conditions', 'accumulation']}),
  
  // Pattern 16: TaxAuthority Administers TaxConcept
  (r:RelationshipType {name: 'ADMINISTERS', source: 'TaxAuthority', target: 'TaxConcept', properties: ['department', 'contactPerson', 'oversightBody']}),
  
  // Pattern 17: Document Supersedes Document
  (r:RelationshipType {name: 'SUPERSEDES', source: 'Document', target: 'Document', properties: ['transitionPeriod', 'obsoleteProvisions']}),
  
  // Pattern 18: TaxConcept HasExample Example
  (r:RelationshipType {name: 'HAS_EXAMPLE', source: 'TaxConcept', target: 'Example', properties: ['complexity', 'applicableScenarios']}),
  
  // Pattern 19: Appeal Challenges Decision
  (r:RelationshipType {name: 'CHALLENGES', source: 'Appeal', target: 'Decision', properties: ['grounds', 'successRate', 'precedents']}),
  
  // Pattern 20: TaxConcept Requires Documentation
  (r:RelationshipType {name: 'REQUIRES', source: 'TaxConcept', target: 'Documentation', properties: ['purpose', 'alternative_documents']}),
  
  // Pattern 21: TaxpayerType HasThreshold ThresholdValue
  (r:RelationshipType {name: 'HAS_THRESHOLD', source: 'TaxpayerType', target: 'ThresholdValue', properties: ['basis', 'evaluation_period', 'verification_method']}),
  
  // Pattern 22: GeographicArea HasSpecialRegime TaxRegime
  (r:RelationshipType {name: 'HAS_SPECIAL_REGIME', source: 'GeographicArea', target: 'TaxRegime', properties: ['authorizing_legislation', 'expiry', 'application_process']});

// Hierarchical Relationships
CREATE
  (r:RelationshipType {name: 'PART_OF', source: 'Document', target: 'Document', properties: ['order', 'importance']}),
  (r:RelationshipType {name: 'CONTAINS', source: 'Document', target: 'TaxConcept', properties: ['section', 'context']}),
  (r:RelationshipType {name: 'FOLLOWED_BY', source: 'Procedure', target: 'Procedure', properties: ['condition', 'timing']}),
  (r:RelationshipType {name: 'RELATED_TO', source: 'TaxConcept', target: 'TaxConcept', properties: ['relationship_type', 'significance']});

// Constraints (example)
CREATE CONSTRAINT FOR (d:Document) REQUIRE d.id IS UNIQUE;
CREATE CONSTRAINT FOR (t:TaxConcept) REQUIRE t.name IS UNIQUE;
CREATE CONSTRAINT FOR (a:TaxAuthority) REQUIRE a.name IS UNIQUE;
CREATE CONSTRAINT FOR (f:Form) REQUIRE f.formNumber IS UNIQUE;

// Indexes (example)
CREATE INDEX FOR (d:Document) ON (d.title);
CREATE INDEX FOR (d:Document) ON (d.effectiveDate);
CREATE INDEX FOR (t:TaxConcept) ON (t.name);
CREATE INDEX FOR (p:Procedure) ON (p.name);
CREATE INDEX FOR (tp:TaxpayerType) ON (tp.name);