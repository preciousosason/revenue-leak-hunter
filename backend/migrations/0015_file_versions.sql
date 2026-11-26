CREATE TABLE IF NOT EXISTS project_file_versions (
 file_id TEXT PRIMARY KEY REFERENCES project_files(id),
 previous_file_id TEXT NOT NULL UNIQUE REFERENCES project_files(id),
 version_number INTEGER NOT NULL CHECK(version_number >= 2),
 CHECK(file_id <> previous_file_id)
);
CREATE TRIGGER IF NOT EXISTS project_file_version_guard BEFORE INSERT ON project_file_versions
WHEN NOT EXISTS (SELECT 1 FROM project_files n JOIN project_files p ON p.id=NEW.previous_file_id LEFT JOIN project_file_versions v ON v.file_id=p.id WHERE n.id=NEW.file_id AND n.project_id=p.project_id AND n.uploaded_by=p.uploaded_by AND NEW.version_number=COALESCE(v.version_number,1)+1 AND NOT EXISTS(SELECT 1 FROM project_file_versions x WHERE x.previous_file_id=n.id))
BEGIN SELECT RAISE(ABORT,'Invalid file revision'); END;
CREATE TRIGGER IF NOT EXISTS project_file_version_no_update BEFORE UPDATE ON project_file_versions BEGIN SELECT RAISE(ABORT,'Immutable file revision'); END;
CREATE TRIGGER IF NOT EXISTS project_file_version_no_delete BEFORE DELETE ON project_file_versions BEGIN SELECT RAISE(ABORT,'Immutable file revision'); END;
