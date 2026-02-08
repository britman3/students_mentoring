#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/backups/pkh-mentoring/$TIMESTAMP"
mkdir -p $BACKUP_DIR
sudo -u postgres pg_dump -p 5433 mentoring_db > $BACKUP_DIR/mentoring_db_$TIMESTAMP.sql
cp -r /opt/students_mentoring/pkh-mentoring $BACKUP_DIR/app
echo "Backup completed: $BACKUP_DIR"
