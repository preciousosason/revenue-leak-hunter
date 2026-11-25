CREATE TABLE IF NOT EXISTS customer_business_notifications (
 id INTEGER PRIMARY KEY, client_id TEXT NOT NULL REFERENCES clients(id),
 kind TEXT NOT NULL, subject_id TEXT NOT NULL, title TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, read_at TEXT
);
CREATE INDEX IF NOT EXISTS business_notifications_owner ON customer_business_notifications(client_id,id DESC);
CREATE TRIGGER IF NOT EXISTS business_notify_request AFTER INSERT ON service_requests  BEGIN
 INSERT INTO customer_business_notifications(client_id,kind,subject_id,title,detail) SELECT NEW.client_id,'request',NEW.id,'Service request received','Your request has been submitted';
END;
CREATE TRIGGER IF NOT EXISTS business_notify_quote AFTER INSERT ON quotations WHEN NEW.status='sent' BEGIN
 INSERT INTO customer_business_notifications(client_id,kind,subject_id,title,detail) SELECT r.client_id,'quotation',NEW.id,'New quotation','A quotation is available for review' FROM service_requests r WHERE r.id=NEW.request_id;
END;
CREATE TRIGGER IF NOT EXISTS business_notify_project AFTER INSERT ON projects  BEGIN
 INSERT INTO customer_business_notifications(client_id,kind,subject_id,title,detail) SELECT r.client_id,'project',NEW.id,'Project activated',NEW.title FROM quotations q JOIN service_requests r ON r.id=q.request_id WHERE q.id=NEW.quotation_id;
END;
CREATE TRIGGER IF NOT EXISTS business_notify_project_status AFTER UPDATE OF status ON projects WHEN OLD.status<>NEW.status BEGIN
 INSERT INTO customer_business_notifications(client_id,kind,subject_id,title,detail) SELECT r.client_id,'project',NEW.id,'Project status: '||NEW.status,NEW.title FROM quotations q JOIN service_requests r ON r.id=q.request_id WHERE q.id=NEW.quotation_id;
END;
CREATE TRIGGER IF NOT EXISTS business_notify_milestone AFTER UPDATE OF status ON project_milestones WHEN OLD.status<>NEW.status BEGIN
 INSERT INTO customer_business_notifications(client_id,kind,subject_id,title,detail) SELECT r.client_id,'milestone',NEW.project_id,'Milestone: '||NEW.status,NEW.title FROM projects p JOIN quotations q ON q.id=p.quotation_id JOIN service_requests r ON r.id=q.request_id WHERE p.id=NEW.project_id;
END;
CREATE TRIGGER IF NOT EXISTS business_notify_milestone_added AFTER INSERT ON project_milestones  BEGIN
 INSERT INTO customer_business_notifications(client_id,kind,subject_id,title,detail) SELECT r.client_id,'milestone',NEW.project_id,'New milestone',NEW.title FROM projects p JOIN quotations q ON q.id=p.quotation_id JOIN service_requests r ON r.id=q.request_id WHERE p.id=NEW.project_id;
END;
CREATE TRIGGER IF NOT EXISTS business_notify_deliverable AFTER INSERT ON project_files WHEN NEW.uploaded_by='admin' BEGIN
 INSERT INTO customer_business_notifications(client_id,kind,subject_id,title,detail) SELECT r.client_id,'file',NEW.project_id,'New project deliverable',NEW.filename FROM projects p JOIN quotations q ON q.id=p.quotation_id JOIN service_requests r ON r.id=q.request_id WHERE p.id=NEW.project_id;
END;
