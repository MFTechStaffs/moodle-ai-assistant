import mysql from 'mysql2/promise';
import { Database } from '../database/Database';

interface MoodleConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}

export class MoodleConnector {
    private connection: mysql.Connection | null = null;
    private memoryDb: Database;
    private config: MoodleConfig;

    constructor(config: MoodleConfig, memoryDb: Database) {
        this.config = config;
        this.memoryDb = memoryDb;
    }

    async connect(): Promise<void> {
        try {
            this.connection = await mysql.createConnection({
                host: this.config.host,
                port: this.config.port,
                user: this.config.user,
                password: this.config.password,
                database: this.config.database
            });
            console.log('Connected to Moodle database');
        } catch (error) {
            console.error('Failed to connect to Moodle database:', error);
            throw error;
        }
    }

    async syncCourses(): Promise<void> {
        if (!this.connection) throw new Error('Not connected to Moodle database');

        const [rows] = await this.connection.execute(`
            SELECT id, fullname, shortname, category, summary, format, 
                   startdate, enddate, visible, timecreated, timemodified
            FROM mdl_course 
            WHERE id > 1
            ORDER BY fullname
        `);

        const courses = rows as any[];
        console.log(`Syncing ${courses.length} courses...`);

        for (const course of courses) {
            await this.memoryDb.saveCourse(course);
        }

        console.log('Courses synced successfully');
    }

    async syncUsers(): Promise<void> {
        if (!this.connection) throw new Error('Not connected to Moodle database');

        const [rows] = await this.connection.execute(`
            SELECT u.id, u.username, u.firstname, u.lastname, u.email, 
                   u.lastaccess, u.timecreated, u.timemodified,
                   GROUP_CONCAT(DISTINCT r.shortname) as roles
            FROM mdl_user u
            LEFT JOIN mdl_role_assignments ra ON u.id = ra.userid
            LEFT JOIN mdl_role r ON ra.roleid = r.id
            WHERE u.deleted = 0 AND u.id > 1
            GROUP BY u.id
            ORDER BY u.lastname, u.firstname
        `);

        const users = rows as any[];
        console.log(`Syncing ${users.length} users...`);

        for (const user of users) {
            await this.memoryDb.saveUser({
                ...user,
                role: user.roles || 'student'
            });
        }

        console.log('Users synced successfully');
    }

    async syncEnrollments(): Promise<void> {
        if (!this.connection) throw new Error('Not connected to Moodle database');

        const [rows] = await this.connection.execute(`
            SELECT ue.userid, ue.enrolid, e.courseid, e.enrol as method,
                   ue.status, ue.timestart, ue.timeend, ue.timecreated,
                   r.shortname as role
            FROM mdl_user_enrolments ue
            JOIN mdl_enrol e ON ue.enrolid = e.id
            LEFT JOIN mdl_role_assignments ra ON (ra.userid = ue.userid AND ra.contextid IN (
                SELECT id FROM mdl_context WHERE contextlevel = 50 AND instanceid = e.courseid
            ))
            LEFT JOIN mdl_role r ON ra.roleid = r.id
            WHERE ue.status = 0
            ORDER BY e.courseid, ue.userid
        `);

        const enrollments = rows as any[];
        console.log(`Syncing ${enrollments.length} enrollments...`);

        // Get internal IDs for users and courses
        const userMap = new Map();
        const courseMap = new Map();
        
        const users = await this.memoryDb.getUsers();
        const courses = await this.memoryDb.getCourses();
        
        users.forEach(u => userMap.set(u.moodle_id, u.id));
        courses.forEach(c => courseMap.set(c.moodle_id, c.id));

        for (const enrollment of enrollments) {
            const userId = userMap.get(enrollment.userid);
            const courseId = courseMap.get(enrollment.courseid);
            
            if (userId && courseId) {
                await this.memoryDb.run(`
                    INSERT OR REPLACE INTO enrollments 
                    (user_id, course_id, role, status, timestart, timeend)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [userId, courseId, enrollment.role || 'student', 
                    enrollment.status, enrollment.timestart, enrollment.timeend]);
            }
        }

        console.log('Enrollments synced successfully');
    }

    async syncQuestions(): Promise<void> {
        if (!this.connection) throw new Error('Not connected to Moodle database');

        const [rows] = await this.connection.execute(`
            SELECT q.id, qbe.questioncategoryid as category, q.name, q.questiontext, q.qtype,
                   q.defaultmark, q.penalty, q.timecreated, q.timemodified
            FROM mdl_question q
            JOIN mdl_question_versions qv ON q.id = qv.questionid
            JOIN mdl_question_bank_entries qbe ON qv.questionbankentryid = qbe.id
            WHERE qv.status = 'ready' AND q.parent = 0
            ORDER BY qbe.questioncategoryid, q.name
        `);

        const questions = rows as any[];
        console.log(`Syncing ${questions.length} questions...`);

        for (const question of questions) {
            await this.memoryDb.saveQuestion(question);
        }

        console.log('Questions synced successfully');
    }

    async syncQuizzes(): Promise<void> {
        if (!this.connection) throw new Error('Not connected to Moodle database');

        const [rows] = await this.connection.execute(`
            SELECT q.id, q.course, q.name, q.intro, q.timeopen, q.timeclose,
                   q.timelimit, q.attempts, q.timecreated, q.timemodified
            FROM mdl_quiz q
            ORDER BY q.course, q.name
        `);

        const quizzes = rows as any[];
        console.log(`Syncing ${quizzes.length} quizzes...`);

        // Get course mapping
        const courses = await this.memoryDb.getCourses();
        const courseMap = new Map();
        courses.forEach(c => courseMap.set(c.moodle_id, c.id));

        for (const quiz of quizzes) {
            const courseId = courseMap.get(quiz.course);
            if (courseId) {
                await this.memoryDb.run(`
                    INSERT OR REPLACE INTO quizzes 
                    (moodle_id, course_id, name, intro, timeopen, timeclose, timelimit, attempts)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [quiz.id, courseId, quiz.name, quiz.intro, 
                    quiz.timeopen, quiz.timeclose, quiz.timelimit, quiz.attempts]);
            }
        }

        console.log('Quizzes synced successfully');
    }

    async fullSync(): Promise<void> {
        console.log('Starting full Moodle sync...');
        
        await this.connect();
        
        try {
            await this.syncCourses();
            await this.syncUsers();
            await this.syncEnrollments();
            await this.syncQuestions();
            await this.syncQuizzes();
            
            console.log('Full sync completed successfully');
        } catch (error) {
            console.error('Sync failed:', error);
            throw error;
        } finally {
            await this.disconnect();
        }
    }

    async getCourseDetails(courseId: number): Promise<any> {
        if (!this.connection) await this.connect();

        const [courseRows] = await this.connection!.execute(`
            SELECT c.*, cc.name as category_name
            FROM mdl_course c
            LEFT JOIN mdl_course_categories cc ON c.category = cc.id
            WHERE c.id = ?
        `, [courseId]);

        const [enrollmentRows] = await this.connection!.execute(`
            SELECT COUNT(*) as count
            FROM mdl_user_enrolments ue
            JOIN mdl_enrol e ON ue.enrolid = e.id
            WHERE e.courseid = ? AND ue.status = 0
        `, [courseId]);

        const [moduleRows] = await this.connection!.execute(`
            SELECT cm.id, cm.module, m.name as module_name, cm.instance
            FROM mdl_course_modules cm
            JOIN mdl_modules m ON cm.module = m.id
            WHERE cm.course = ? AND cm.visible = 1
            ORDER BY cm.section, cm.sequence
        `, [courseId]);

        const course = (courseRows as any[])[0];
        const enrollmentCount = (enrollmentRows as any[])[0].count;
        const modules = moduleRows as any[];

        return {
            ...course,
            enrollment_count: enrollmentCount,
            modules: modules
        };
    }

    async getQuestionBankStats(categoryId?: number): Promise<any> {
        if (!this.connection) await this.connect();

        let sql = `
            SELECT 
                q.qtype,
                COUNT(*) as count,
                AVG(q.defaultmark) as avg_mark
            FROM mdl_question q
            WHERE q.parent = 0
        `;
        
        const params: any[] = [];
        if (categoryId) {
            sql += ' AND q.category = ?';
            params.push(categoryId);
        }
        
        sql += ' GROUP BY q.qtype ORDER BY count DESC';

        const [rows] = await this.connection!.execute(sql, params);
        return rows;
    }

    async disconnect(): Promise<void> {
        if (this.connection) {
            await this.connection.end();
            this.connection = null;
            console.log('Disconnected from Moodle database');
        }
    }
}