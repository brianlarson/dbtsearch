-- MySQL 8+ schema for stack-rewrite (Vue/Nuxt + Craft-aligned).
-- Same structure as data/database.sql (Postgres). Use with DDEV MySQL 8+.

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS providers;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- Users (auth)
CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  password VARCHAR(1000) NOT NULL,
  inserted_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX (username)
);

DELIMITER //
CREATE TRIGGER users_before_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
END//
DELIMITER ;

-- Providers (directory)
CREATE TABLE providers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) DEFAULT NULL,
  dbta_certified TINYINT(1) DEFAULT 0,
  availability TINYINT(1) DEFAULT 0,
  address VARCHAR(255) DEFAULT NULL,
  city VARCHAR(255) DEFAULT NULL,
  state VARCHAR(255) DEFAULT NULL,
  zip VARCHAR(20) DEFAULT NULL,
  website VARCHAR(255) DEFAULT NULL,
  image VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  dbt_certificate_expires DATETIME(6) DEFAULT NULL,
  manager_id INT UNSIGNED DEFAULT NULL,
  inserted_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX (city),
  INDEX (state),
  INDEX (dbta_certified)
);

DELIMITER //
CREATE TRIGGER providers_before_update
BEFORE UPDATE ON providers
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
END//
DELIMITER ;

-- Seed data (same as Postgres version)
INSERT INTO providers (
  name, dbta_certified, availability, address, city, state, zip, website, image, phone, email, dbt_certificate_expires
) VALUES
('Addictions and Stress Clinic dba ASC Psychological Services', 0, 1, '12 Civic Center Plaza #615', 'Mankato', 'MN', '56001', 'https://www.ascpsychological.com/contact-us/', 'asc-psychological-services.webp', '507-345-4679', NULL, '2024-08-23 00:00:00'),
('Addictions and Stress Clinic dba ASC Psychological Services', 0, 1, '2277 Highway 36 #150 & #155', 'Roseville', 'MN', '55113', 'https://www.ascpsychological.com/contact-us/', 'asc-psychological-services.webp', '507-345-4679', NULL, '2024-08-23 00:00:00'),
('Advanced Behavioral Health, Inc', 0, 0, '6160 Summit Dr N Ste 375', 'Brooklyn Center', 'MN', '55430', 'http://www.abhtherapy.com/', 'advanded-behavioral-health-inc.png', '763-560-8331', NULL, '2026-06-01 00:00:00'),
('Align Your Soul Counseling Provider', 1, 0, 'Ironwood Square Building 300 3rd Ave Suite 302', 'Rochester', 'MN', '55904', 'http://www.alignyoursoulcounseling.com/', NULL, '507-218-5913', NULL, '2026-06-26 00:00:00'),
('Art of Counseling PLLC Provider', 1, 0, '275 4th St East Suite 301', 'St Paul', 'MN', '55101', 'https://artofcounselingstpaul.com/', NULL, '651-318-0109', NULL, '2026-12-01 00:00:00'),
('Associated Clinic of Psychology (ACP DBT) Provider', 1, 1, '4027 County Road 25', 'Minneapolis', 'MN', '55416', 'http://acp-mn.com/', NULL, '612-925-6033', NULL, '2026-02-21 00:00:00'),
('Associated Clinic of Psychology (ACP DBT) Provider', 1, 0, '6950 W 146th St Suite 100', 'Apple Valley', 'MN', '55124', 'http://acp-mn.com/', NULL, '952-432-1484', NULL, '2026-02-21 00:00:00'),
('Associated Clinic of Psychology (ACP DBT) Provider', 1, 0, '149 Thompson Ave E Suite 150W', 'St Paul', 'MN', '55118', 'http://acp-mn.com/', NULL, '651-450-0860', NULL, '2026-02-11 00:00:00'),
('Autonomy Counseling', 0, 0, '800 Holiday Dr Suite 170', 'Moorhead', 'MN', '56560', 'https://www.autonomycounseling.com/', NULL, '218 293 4221', NULL, '2027-09-06 00:00:00'),
('Avalon St Anthony Park - Meridian Behavioral Health', 0, 0, '1821 University Avenue West Suite N 385', 'St Paul', 'MN', '55104', 'https://nbminnesota.com/', NULL, '612-326-7579', NULL, '2024-10-31 00:00:00'),
('Choices Psychotherapy Ltd', 0, 0, '10201 Wayzata Boulevard Suite 100', 'Minnetonka', 'MN', '55305', 'https://choicespsychotherapy.net/services/dbt/', NULL, '952-544-6806', NULL, '2027-04-12 00:00:00'),
('Choices Psychotherapy Ltd', 0, 0, '7901 Xerxes Ave S Suite 225', 'Bloomington', 'MN', '55431', 'https://choicespsychotherapy.net/services/dbt/', NULL, '952-544-6806', NULL, '2027-04-12 00:00:00'),
('Choices Psychotherapy Ltd', 0, 0, '7975 Stone Creek Dr Suite 130', 'Chanhassen', 'MN', '55317', 'https://choicespsychotherapy.net/services/dbt/', NULL, '952-544-6806', NULL, '2027-04-12 00:00:00'),
('DBT-PTSD & EMDR Specialist', 0, 0, '10000 Hwy 55 Suite 300', 'Plymouth', 'MN', '55441', 'https://dbt-ptsdspecialists.com/', NULL, '763-412-0722', NULL, '2026-08-31 00:00:00'),
('DBT Associates Provider', 1, 0, '7362 University Avenue Northeast Suite 101', 'Fridley', 'MN', '55432', 'https://www.dbtassociates.com/', NULL, '763-503-3981', NULL, '2026-01-22 00:00:00'),
('Elevacare dba Southwest Mental Health Clinic', 0, 1, '1210 5th Avenue', 'Worthington', 'MN', '56187', 'https://www.elevacare.org/', NULL, '507-376-4141', NULL, '2025-09-30 00:00:00'),
('Family Services of Rochester Provider', 1, 1, '4600 18th Avenue Northwest', 'Rochester', 'MN', '55901', 'http://familyservicerochester.org/', NULL, '507-507-2010', NULL, '2026-04-14 00:00:00'),
('Healing Connections Therapy Center', 0, 0, '1751 Southcross Drive West', 'Burnsville', 'MN', '55306', 'http://www.healingconnectionsonline.com/', NULL, '952-892-7690', NULL, '2026-06-01 00:00:00'),
('Healthy Minds', 0, 0, '400 Selby Ave Ste Q', 'St Paul', 'MN', '55102', 'https://www.healthyminds.io/', NULL, '651-571-2865', NULL, '2025-02-05 00:00:00'),
('HP Psychological Associates PC', 0, 0, '4815 Burning Tree Road Ste 200', 'Duluth', 'MN', '55811', 'http://www.hppsychological.com/', NULL, '218-464-0908', NULL, '2025-05-12 00:00:00'),
('Imagine Mental Health Counseling', 0, 0, '116 Ash Ave NW Suite 2', 'Wadena', 'MN', '56482', 'https://imaginemhc.com/', NULL, '218-632-4300', NULL, '2025-01-18 00:00:00'),
('Independent Management Services Provider', 1, 0, '101 21st Street Suite 1', 'Austin', 'MN', '55912', 'https://www.imsofmn.com/', NULL, '507-437-6389', NULL, '2026-05-14 00:00:00'),
('Independent Management Services Provider', 1, 0, '226 W Clark Street', 'Albert Lea', 'MN', '56007', 'https://www.imsofmn.com/', NULL, '507-437-6389', NULL, '2026-05-14 00:00:00'),
('Lakeland Mental Health Center', 0, 0, '702 34th Avenue East', 'Alexandria', 'MN', '56308', 'https://lmhc.org/', NULL, '320-762-2400', NULL, '2026-05-18 00:00:00'),
('Life Development Resources PA Provider', 1, 0, '7580 160th Street West', 'Lakeville', 'MN', '55044', 'http://lifedrs.com/', NULL, '952-898-1133', NULL, '2026-07-18 00:00:00'),
('Life Development Resources PA Provider', 1, 0, '1619 Dayton Avenue', 'St Paul', 'MN', '55104', 'http://lifedrs.com/', NULL, '952-898-1133', NULL, '2026-07-18 00:00:00'),
('Lighthouse Child & Family Services LLC', 0, 0, '160 3rd Avenue Northwest', 'Milaca', 'MN', '56353', 'http://www.lighthousecfs.com/', NULL, '320-983-2335', NULL, '2026-08-31 00:00:00'),
('MAP Behavioral Health Center', 0, 0, '324 West Superior St Suite 260', 'Duluth', 'MN', '55802', 'https://www.mapbhc.com/', NULL, '218 606-1797', NULL, '2024-09-01 00:00:00'),
('The Meadows Counseling Center Provider', 1, 1, '3737 40th Avenue Northwest', 'Rochester', 'MN', '55901', 'http://www.highlandmeadowscc.com/', NULL, '507-288-6978', NULL, '2027-10-30 00:00:00'),
('Mental Health Systems - Adherent Team Only', 0, 0, '6600 France Avenue Suite 230', 'Edina', 'MN', '55435', 'https://www.mhs-dbt.com/', NULL, '952-835-2002', NULL, '2026-10-04 00:00:00'),
('Mental Health Systems - Adherent Team Only', 0, 0, '6063 Hudson Road Suite 200', 'Woodbury', 'MN', '55125', 'https://www.mhs-dbt.com/', NULL, '763-325-1686', NULL, '2026-10-04 00:00:00'),
('Minnesota Center for Psychology LLC Provider', 1, 0, '2324 University Avenue West Suite 120', 'St Paul', 'MN', '55114', 'https://www.minnesotacenterforpsychology.com/dialectical-behavior-therapy', NULL, '651-644-4100', NULL, '2026-07-31 00:00:00'),
('Mindfully Healing Inc', 0, 0, '4154 Shoreline Drive Suite 202', 'Spring Park', 'MN', '55384', 'https://mindfullyhealing.com/', NULL, '952-491-9450', NULL, '2025-02-05 00:00:00'),
('Mindfully Healing Inc', 0, 0, '101 Main Street South Suite 102', 'Hutchinson', 'MN', '55350', 'https://mindfullyhealing.com/', NULL, '952-491-9450', NULL, '2025-02-05 00:00:00'),
('Mindfully Healing Inc', 0, 0, '10650 Red Circle Dr Suite 103', 'Minnetonka', 'MN', '55343', 'https://mindfullyhealing.com/', NULL, '952-491-9450', NULL, '2025-02-05 00:00:00'),
('Natalis Counseling and Psychology Solutions', 0, 0, '1600 University Avenue West', 'St Paul', 'MN', '55104', 'https://www.natalispsychology.com/', NULL, '651-379-5157', NULL, '2026-11-12 00:00:00'),
('Northern Pines Mental Health Center Inc Provider', 1, 0, '520 5th Street Northwest', 'Brainerd', 'MN', '56401', 'http://www.npmh.org/', NULL, '218-892-3235', NULL, '2026-06-10 00:00:00'),
('Northern Pines Mental Health Center Inc Provider', 1, 0, '1906 5th Avenue SE', 'Little Falls', 'MN', '56345', 'http://www.npmh.org/', NULL, '320-639-2025', NULL, '2026-06-10 00:00:00'),
('Northern Pines Mental Health Center Inc Provider', 1, 0, '16 9th Ave SE', 'Long Prairie', 'MN', '56347', 'http://www.npmh.org/', NULL, '320-639-2025', NULL, '2026-06-10 00:00:00'),
('Northern Pines Mental Health Center Inc Provider', 1, 0, '11 2nd St W', 'Wadena', 'MN', '56482', 'http://www.npmh.org/', NULL, '320-639-2025', NULL, '2026-06-10 00:00:00'),
('Northland Counseling Center - Grand Rapids', 0, 0, '215 SE 2nd Avenue', 'Grand Rapids', 'MN', '55744', 'https://northlandcounseling.org/mental-health/dialectical-behavior-therapy/', NULL, '218-326-1274', NULL, '2026-08-31 00:00:00'),
('Northland Counseling Center - International Falls', 0, 0, '900 5th Street Suite 305', 'International Falls', 'MN', '56649', 'http://northlandcounselingifalls.org/', NULL, '218-283-3406', NULL, '2026-08-31 00:00:00'),
('Northland Counseling Center - Grand Rapids', 0, 0, '3130 SE 2nd Ave', 'Grand Rapids', 'MN', '55744', 'http://northlandcounselingifalls.org/', NULL, '218-283-3406', NULL, '2026-08-31 00:00:00'),
('Northland Counseling Center - International Falls', 0, 0, '1902 Valley Pine Circle', 'International Falls', 'MN', '56649', 'http://northlandcounselingifalls.org/', NULL, '218-283-3406', NULL, '2026-08-31 00:00:00'),
('Nystrom and Associates Ltd', 0, 1, '1101 East 78th Street Suite 100', 'Bloomington', 'MN', '55420', 'https://www.nystromcounseling.com/our-services/dialectical-behavior-therapy/', NULL, '952-854-5034', NULL, '2026-12-12 00:00:00'),
('Nystrom and Associates Ltd Provider', 1, 1, '11660 Round Lake Boulevard Northwest', 'Coon Rapids', 'MN', '55433', 'https://www.nystromcounseling.com/our-services/dialectical-behavior-therapy/', NULL, '763-767-3350', NULL, '2026-12-12 00:00:00'),
('Nystrom and Associates Ltd', 0, 0, '332 West Superior StreetSuite 300', 'Duluth', 'MN', '55802', 'https://www.nystromcounseling.com/our-services/dialectical-behavior-therapy/', NULL, '218-722-4379', NULL, '2026-12-12 00:00:00'),
('Nystrom and Associates Ltd Provider', 1, 0, '11010 Prairie Lakes Drive Suite 350', 'Eden Prairie', 'MN', '55344', 'https://www.nystromcounseling.com/our-services/dialectical-behavior-therapy/', NULL, '952-746-2522', NULL, '2026-12-12 00:00:00'),
('Nystrom and Associates Ltd Provider', 1, 1, '17685 Juniper Path Suite 303', 'Lakeville', 'MN', '55044', 'https://www.nystromcounseling.com/our-services/dialectical-behavior-therapy/', NULL, '952-214-8959', NULL, '2026-04-06 00:00:00'),
('Nystrom and Associates Ltd Provider', 1, 0, '201 North Broad Street', 'Mankato', 'MN', '56011', 'https://www.nystromcounseling.com/our-services/dialectical-behavior-therapy-dbt/', NULL, '507-225-1500', NULL, '2025-06-30 00:00:00'),
('Nystrom and Associates Ltd Provider', 1, 0, '13603 80th Circle North', 'Maple Grove', 'MN', '55369', 'https://www.nystromcounseling.com/our-services/dialectical-behavior-therapy/', NULL, '763-274-3120', NULL, '2026-12-12 00:00:00'),
('Nystrom and Associates Ltd', 0, 0, '13100 Wayzata Boulevard Suite 200', 'Minnetonka', 'MN', '55305', 'https://www.nystromcounseling.com/', NULL, '952-206-2040', NULL, '2026-12-12 00:00:00'),
('Nystrom and Associates Ltd Provider', 1, 0, '1900 Silver Lake Road Suite 110', 'New Brighton', 'MN', '55112', 'https://www.nystromcounseling.com/our-services/dialectical-behavior-therapy/', NULL, '651-628-9566', NULL, '2026-12-12 00:00:00'),
('Nystrom and Associates Ltd', 0, 0, '9245 Quantrelle Avenue', 'Otsego', 'MN', '55330', 'https://www.nystromcounseling.com/our-services/dialectical-behavior-therapy/', NULL, '763-746-9492', NULL, '2026-12-12 00:00:00'),
('Nystrom and Associates Ltd Provider', 1, 0, '101 Delher Drive', 'St. Cloud', 'MN', '56377', 'https://www.nystromcounseling.com/our-services/dialectical-behavior-therapy/', NULL, '320-253-3512', NULL, '2026-12-12 00:00:00'),
('Nystrom and Associates Ltd Provider', 1, 0, '1811 Weir Drive Suite 270', 'Woodbury', 'MN', '55125', 'https://www.nystromcounseling.com/our-locations/minnesota/woodbury-clinic/', NULL, '651-714-9646', NULL, '2026-12-12 00:00:00'),
('Nystrom and Associates Ltd', 0, 0, '2405 8th Street SouthSuite 200', 'Moorhead', 'MN', '56560', 'https://www.nystromcounseling.com/our-services/dialectical-behavior-therapy/', NULL, '952-997-3020', NULL, '2026-12-12 00:00:00'),
('Olmsted County DBT Program', 0, 0, '2100 Campus Drive Southeast Suite 200', 'Rochester', 'MN', '55904', 'https://www.olmstedcounty.gov/residents/services-individuals-families/adults-seniors/adult-behavioral-health#considering-dbt4', NULL, '507-328-6400', NULL, '2026-06-05 00:00:00'),
('Omni Mental Health', 0, 1, '245 Ruth Street North Suite 101', 'St Paul', 'MN', '55119', 'https://www.omnimentalhealth.com/', NULL, '651-955-4633', NULL, '2026-08-31 00:00:00'),
('Omni Mental Health', 0, 0, '9298 Central Ave NE Suite 310', 'Blaine', 'MN', '55434', 'https://www.omnimentalhealth.com/', NULL, '651-955-4633', NULL, '2026-08-31 00:00:00'),
('Omni Mental Health', 0, 0, '268 S Main St', 'Zumbrota', 'MN', '55992', 'https://www.omnimentalhealth.com/', NULL, '651-955-4633', NULL, '2026-08-31 00:00:00'),
('Omni Mental Health', 0, 0, '2 N Minnesota St', 'New Ulm', 'MN', '56073', 'https://www.omnimentalhealth.com/', NULL, '651-955-4633', NULL, '2026-08-31 00:00:00'),
('Parker Collins Family Mental Health', 1, 0, '1056 Centerville Circle', 'Vadnais Heights', 'MN', '55127', 'https://parkercollins.com/', NULL, '615-604-7771', NULL, '2026-02-17 00:00:00'),
('Psych Recovery Inc', 0, 0, '2550 University Ave West Suite 229N', 'St Paul', 'MN', '55114', 'http://www.psychrecoveryinc.com/dbt.html', NULL, '651-645-3115', NULL, '2028-09-21 00:00:00'),
('RADIAS Health Provider', 1, 0, '166 4th Street East', 'St Paul', 'MN', '55101', 'http://www.south-metro.org/programs/', NULL, '651-389-4690', NULL, '2026-04-20 00:00:00'),
('Riverstone Psychological Services Inc. Provider', 1, 0, '511 Northern Hills Drive Northeast Suite 2', 'Rochester', 'MN', '55906', 'https://www.riverstonepsych.com/', NULL, '507-696-2523', NULL, '2024-12-16 00:00:00'),
('Schmidt Counseling Services Inc dba Southbridge Counseling Associates', 0, 0, '8646 Eagle Creek Circle Suite 213', 'Savage', 'MN', '55378', 'http://www.southbridgecounseling.com/', NULL, '952-583-1055', NULL, '2024-11-03 00:00:00'),
('Secure Base Counseling Center Provider', 1, 0, '570 Professional Drive', 'Northfield', 'MN', '55057', 'https://www.securebasecounselingcenter.com/', NULL, '507-301-3412', NULL, '2026-05-26 00:00:00'),
('Secure Base Counseling Center Provider', 1, 0, '213 First St', 'Farmington', 'MN', '55024', 'https://www.securebasecounselingcenter.com/', NULL, '507-301-3412', NULL, '2026-05-26 00:00:00'),
('Secure Base Counseling Center Provider', 1, 1, '301 E Main St', 'New Prague', 'MN', '56071', 'https://www.securebasecounselingcenter.com/', NULL, '507-301-3412', NULL, '2026-05-26 00:00:00'),
('Solutions Behavioral Health Center', 0, 0, '891 Belsly Boulevard', 'Moorhead', 'MN', '56560', 'https://www.solutionsinpractice.org/', NULL, '218-287-4338', NULL, '2026-08-31 00:00:00'),
('Solutions Behavioral Health Center', 0, 0, '1104 West River Road', 'Detroit Lakes', 'MN', '56051', 'https://www.solutionsinpractice.org/', NULL, '218-844-6853', NULL, '2026-08-31 00:00:00'),
('Solutions Behavioral Health Center', 0, 0, '1806 Fir Avenue E Suite 200', 'Fergus Falls', 'MN', '56537', 'https://www.solutionsinpractice.org/', NULL, '218-988-2992', NULL, '2026-08-31 00:00:00'),
('Solutions Behavioral Health Center', 0, 0, '423 Great Oak Dr', 'Waite Park', 'MN', '56387', 'https://www.solutionsinpractice.org/', NULL, '320-281-5305', NULL, '2026-08-31 00:00:00'),
('Tiny Tree Counseling & Consulting LLC', 0, 1, '3950 Lyndale Ave S Suite 2', 'Minneapolis', 'MN', '55409', 'https://www.tinytreecounseling.com/', 'tiny-tree-counseling.png', '833-482-5546', 'support@tinytreecounseling.com', '2025-03-04 00:00:00'),
('Tubman Chrysalis Center', 0, 0, '4432 Chicago Avenue South', 'Minneapolis', 'MN', '55407', 'https://www.tubman.org/', NULL, '612-870-2426', NULL, '2024-05-07 00:00:00'),
('Volunteers of America of MN Mental Health Clinic dba Vona Center for Mental Health by Volunteers of America of MN Provider', 1, 1, '9220 Bass Lake Road Suite 255', 'New Hope', 'MN', '55422', 'http://www.voamnwi.org/dbt-outpatient-therapy', NULL, '763-225-4029', NULL, '2026-08-31 00:00:00'),
('Washburn Center for Children', 0, 0, '1100 Glenwood Ave', 'Minneapolis', 'MN', '55405', 'https://washburn.org/', NULL, '612-871-1454', NULL, '2025-06-26 00:00:00'),
('Western Mental Health Clinic Provider', 1, 0, '1212 East College Drive', 'Marshall', 'MN', '56258', 'http://wmhcinc.org/', NULL, '507-532-3236', NULL, '2026-07-31 00:00:00'),
('Western Mental Health Clinic Provider', 1, 1, '112 St. Olaf Ave S', 'Canby', 'MN', '56220', 'http://wmhcinc.org/', NULL, '800-658-2429', NULL, '2026-07-31 00:00:00'),
('Western Mental Health Clinic Provider', 1, 1, '818 Prentice Drive', 'Granite Falls', 'MN', '56241', 'http://wmhcinc.org/', NULL, '800-658-2449', NULL, '2026-07-31 00:00:00'),
('Western Mental Health Clinic Provider', 1, 1, '2001 Maple St', 'Slayton', 'MN', '56172', 'http://wmhcinc.org/', NULL, '800-658-2249', NULL, '2026-07-31 00:00:00'),
('Western Mental Health Clinic Provider', 1, 0, '101 Caring Way', 'Redwood Falls', 'MN', '56283', 'http://wmhcinc.org/', NULL, '507-532-3236', NULL, '2026-07-31 00:00:00'),
('Western Mental Health Clinic Provider', 1, 0, '2042 Juniper Drive', 'Slayton', 'MN', '56172', 'http://wmhcinc.org/', NULL, '800-658-2429', NULL, '2026-07-31 00:00:00'),
('Western Mental Health Clinic Provider', 1, 0, '240 Willow St', 'Tyler', 'MN', '56178', 'http://wmhcinc.org/', NULL, '800-658-2429', NULL, '2026-07-31 00:00:00'),
('Wholehearted Healing LLC', 0, 0, '6381 Osgood Ave North Building C', 'Stillwater', 'MN', '55082', 'https://www.wholeheartedhealingllc.com/', NULL, '612-217-1560', NULL, '2025-07-18 00:00:00');
