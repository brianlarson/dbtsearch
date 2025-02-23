-------------------------------------------------------
--------------------------------------------------
-- START FROM SCRATCH:
DROP TRIGGER IF EXISTS "on_user_update" ON "users";
DROP TABLE IF EXISTS "users";


-------------------------------------------------------
--------------------------------------------------
-- TABLE SCHEMAS:
CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "username" VARCHAR (80) UNIQUE NOT NULL,
  "password" VARCHAR (1000) NOT NULL,
  "inserted_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);


-------------------------------------------------------
--------------------------------------------------
-- SEED DATA:
--   You'll need to actually register users via the application in order to get hashed
--   passwords. Once you've done that, you can modify this INSERT statement to include
--   your dummy users. Be sure to copy/paste their hashed passwords, as well.
--   This is only for development purposes! Here's a commented-out example:
-- INSERT INTO "users"
--   ("username", "password")
--   VALUES
--   ('unicorn10', '$2a$10$oGi81qjXmTh/slGzYOr2fu6NGuCwB4kngsiWQPToNrZf5X8hxkeNG'), --pw: 123
--   ('cactusfox', '$2a$10$8./c/6fB2BkzdIrAUMWOxOlR75kgmbx/JMrMA5gA70c9IAobVZquW'); --pw: 123


-------------------------------------------------------
--------------------------------------------------
-- AUTOMAGIC UPDATED_AT:

-- Did you know that you can make and execute functions
-- in PostgresQL? Wild, right!? I'm not making this up. Here
-- is proof that I am not making this up:
  -- https://x-team.com/blog/automatic-timestamps-with-postgresql/

-- Create a function that sets a row's updated_at column
-- to NOW():
CREATE OR REPLACE FUNCTION set_updated_at_to_now() -- 👈
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger on the user table that will execute
-- the set_update_at_to_now function on any rows that
-- have been touched by an UPDATE query:
CREATE TRIGGER on_user_update
BEFORE UPDATE ON "users"
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at_to_now();

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "username" VARCHAR (80) UNIQUE NOT NULL,
  "password" VARCHAR (1000) NOT NULL,
  "inserted_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "providers" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR,
  "dbta_certified" BOOLEAN DEFAULT FALSE,
  "availability" BOOLEAN DEFAULT FALSE,
  "address" VARCHAR,
  "city" VARCHAR,
  "state" VARCHAR,
  "zip" VARCHAR,
  "website" VARCHAR,
  "image" VARCHAR,
  "phone" VARCHAR,
  "email" VARCHAR,
  "dbt_certificate_expires" TIMESTAMPTZ,
  "manager_id" INT REFERENCES users(id),
  "inserted_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO providers (
  "name", 
  "dbta_certified", 
  "availability", 
  "address", 
  "city", 
  "state", 
  "zip",
  "website", 
  "image", 
  "phone",
  "email",
  "dbt_certificate_expires")
VALUES
('Addictions and Stress Clinic dba ASC Psychological Services', FALSE, TRUE, '12 Civic Center Plaza #615', 'Mankato', 'MN', 56001, 'https://www.ascpsychological.com/contact-us/', 'asc-psychological-services.webp', '507-345-4679', NULL, '2024-08-23 00:00:00'),
('Addictions and Stress Clinic dba ASC Psychological Services', FALSE, TRUE, '2277 Highway 36 #150 & #155', 'Roseville', 'MN', 55113, 'https://www.ascpsychological.com/contact-us/', 'asc-psychological-services.webp', '507-345-4679', NULL, '2024-08-23 00:00:00'),
('Advanced Behavioral Health, Inc', FALSE, FALSE, '6160 Summit Dr N Ste 375', 'Brooklyn Center', 'MN', 55430, 'http://www.abhtherapy.com/', 'advanded-behavioral-health-inc.png', '763-560-8331', NULL, '2026-06-01 00:00:00'),
('Align Your Soul Counseling Provider', TRUE, FALSE, 'Ironwood Square Building 300 3rd Ave Suite 302', 'Rochester', 'MN', 55904, 'http://www.alignyoursoulcounseling.com/', NULL, '507-218-5913', NULL, '2026-06-26 00:00:00'),
('Art of Counseling PLLC Provider', TRUE, FALSE, '275 4th St East Suite 301', 'St Paul', 'MN', 55101, 'https://artofcounselingstpaul.com/', NULL, '651-318-0109', NULL, '2026-12-01 00:00:00'),
('Associated Clinic of Psychology (ACP DBT) Provider', TRUE, TRUE, '4027 County Road 25', 'Minneapolis', 'MN', 55416, 'http://acp-mn.com/', NULL, '612-925-6033', NULL, '2026-02-21 00:00:00'),
('Associated Clinic of Psychology (ACP DBT) Provider', TRUE, FALSE, '6950 W 146th St Suite 100', 'Apple Valley', 'MN', 55124, 'http://acp-mn.com/', NULL, '952-432-1484', NULL, '2026-02-21 00:00:00'),
('Associated Clinic of Psychology (ACP DBT) Provider', TRUE, FALSE, '149 Thompson Ave E Suite 150W', 'St Paul', 'MN', 55118, 'http://acp-mn.com/', NULL, '651-450-0860', NULL, '2026-02-11 00:00:00'),
('Autonomy Counseling', FALSE, FALSE, '800 Holiday Dr Suite 170', 'Moorhead', 'MN', 56560, 'https://www.autonomycounseling.com/', NULL, '218 293 4221', NULL, '2027-09-06 00:00:00'),
('Avalon St Anthony Park - Meridian Behavioral Health', FALSE, FALSE, '1821 University Avenue West Suite N 385', 'St Paul', 'MN', 55104, 'https://nbminnesota.com/', NULL, '612-326-7579', NULL, '2024-10-31 00:00:00'),
('Choices Psychotherapy Ltd', FALSE, FALSE, '10201 Wayzata Boulevard Suite 100', 'Minnetonka', 'MN', 55305, 'https://choicespsychotherapy.net/services/dbt/', NULL, '952-544-6806', NULL, '2027-04-12 00:00:00'),
('Choices Psychotherapy Ltd', FALSE, FALSE, '7901 Xerxes Ave S Suite 225', 'Bloomington', 'MN', 55431, 'https://choicespsychotherapy.net/services/dbt/', NULL, '952-544-6806', NULL, '2027-04-12 00:00:00'),
('Choices Psychotherapy Ltd', FALSE, FALSE, '7975 Stone Creek Dr Suite 130', 'Chanhassen', 'MN', 55317, 'https://choicespsychotherapy.net/services/dbt/', NULL, '952-544-6806', NULL, '2027-04-12 00:00:00'),
('DBT-PTSD & EMDR Specialist', FALSE, FALSE, '10000 Hwy 55 Suite 300', 'Plymouth', 'MN', 55441, 'https://dbt-ptsdspecialists.com/', NULL, '763-412-0722', NULL, '2026-08-31 00:00:00'),
('DBT Associates Provider', TRUE, FALSE, '7362 University Avenue Northeast Suite 101', 'Fridley', 'MN', 55432, 'https://www.dbtassociates.com/', NULL, '763-503-3981', NULL, '2026-01-22 00:00:00'),
('Elevacare dba Southwest Mental Health Clinic', FALSE, TRUE, '1210 5th Avenue', 'Worthington', 'MN', 56187, 'https://www.elevacare.org/', NULL, '507-376-4141', NULL, '2025-09-30 00:00:00'),
('Family Services of Rochester Provider', TRUE, TRUE, '4600 18th Avenue Northwest', 'Rochester', 'MN', 55901, 'http://familyservicerochester.org/', NULL, '507-507-2010', NULL, '2026-04-14 00:00:00'),
('Healing Connections Therapy Center', FALSE, FALSE, '1751 Southcross Drive West', 'Burnsville', 'MN', 55306, 'http://www.healingconnectionsonline.com/', NULL, '952-892-7690', NULL, '2026-06-01 00:00:00'),
('Healthy Minds', FALSE, FALSE, '400 Selby Ave Ste Q', 'St Paul', 'MN', 55102, 'https://www.healthyminds.io/', NULL, '651-571-2865', NULL, '2025-02-05 00:00:00'),
('HP Psychological Associates PC', FALSE, FALSE, '4815 Burning Tree Road Ste 200', 'Duluth', 'MN', 55811, 'http://www.hppsychological.com/', NULL, '218-464-0908', NULL, '2025-05-12 00:00:00'),
('Imagine Mental Health Counseling', FALSE, FALSE, '116 Ash Ave NW Suite 2', 'Wadena', 'MN', 56482, 'https://imaginemhc.com/', NULL, '218-632-4300', NULL, '2025-01-18 00:00:00'),
('Independent Management Services Provider', TRUE, FALSE, '101 21st Street Suite 1', 'Austin', 'MN', 55912, 'https://www.imsofmn.com/', NULL, '507-437-6389', NULL, '2026-05-14 00:00:00'),
('Independent Management Services Provider', TRUE, FALSE, '226 W Clark Street', 'Albert Lea', 'MN', 56007, 'https://www.imsofmn.com/', NULL, '507-437-6389', NULL, '2026-05-14 00:00:00'),
('Lakeland Mental Health Center', FALSE, FALSE, '702 34th Avenue East', 'Alexandria', 'MN', 56308, 'https://lmhc.org/', NULL, '320-762-2400', NULL, '2026-05-18 00:00:00'),
('Life Development Resources PA Provider', TRUE, FALSE, '7580 160th Street West', 'Lakeville', 'MN', 55044, 'http://lifedrs.com/', NULL, '952-898-1133', NULL, '2026-07-18 00:00:00'),
('Life Development Resources PA Provider', TRUE, FALSE, '1619 Dayton Avenue', 'St Paul', 'MN', 55104, 'http://lifedrs.com/', NULL, '952-898-1133', NULL, '2026-07-18 00:00:00'),
('Lighthouse Child & Family Services LLC', FALSE, FALSE, '160 3rd Avenue Northwest', 'Milaca', 'MN', 56353, 'http://www.lighthousecfs.com/', NULL, '320-983-2335', NULL, '2026-08-31 00:00:00'),
('MAP Behavioral Health Center', FALSE, FALSE, '324 West Superior St Suite 260', 'Duluth', 'MN', 55802, 'https://www.mapbhc.com/', NULL, '218 606-1797', NULL, '2024-09-01 00:00:00'),
('The Meadows Counseling Center Provider', TRUE, TRUE, '3737 40th Avenue Northwest', 'Rochester', 'MN', 55901, 'http://www.highlandmeadowscc.com/', NULL, '507-288-6978', NULL, '2027-10-30 00:00:00'),
('Mental Health Systems - Adherent Team Only', FALSE, FALSE, '6600 France Avenue Suite 230', 'Edina', 'MN', 55435, 'https://www.mhs-dbt.com/', NULL, '952-835-2002', NULL, '2026-10-04 00:00:00'),
('Mental Health Systems - Adherent Team Only', FALSE, FALSE, '6063 Hudson Road Suite 200', 'Woodbury', 'MN', 55125, 'https://www.mhs-dbt.com/', NULL, '763-325-1686', NULL, '2026-10-04 00:00:00'),
('Minnesota Center for Psychology LLC Provider', TRUE, FALSE, '2324 University Avenue West Suite 120', 'St Paul', 'MN', 55114, 'https://www.minnesotacenterforpsychology.com/dialectical-behavior-therapy', NULL, '651-644-4100', NULL, '2026-07-31 00:00:00'),
('Mindfully Healing Inc', FALSE, FALSE, '4154 Shoreline Drive Suite 202', 'Spring Park', 'MN', 55384, 'https://mindfullyhealing.com/', NULL, '952-491-9450', NULL, '2025-02-05 00:00:00'),
('Mindfully Healing Inc', FALSE, FALSE, '101 Main Street South Suite 102', 'Hutchinson', 'MN', 55350, 'https://mindfullyhealing.com/', NULL, '952-491-9450', NULL, '2025-02-05 00:00:00'),
('Mindfully Healing Inc', FALSE, FALSE, '10650 Red Circle Dr Suite 103', 'Minnetonka', 'MN', 55343, 'https://mindfullyhealing.com/', NULL, '952-491-9450', NULL, '2025-02-05 00:00:00'),
('Natalis Counseling and Psychology Solutions', FALSE, FALSE, '1600 University Avenue West', 'St Paul', 'MN', 55104, 'https://www.natalispsychology.com/', NULL, '651-379-5157', NULL, '2026-11-12 00:00:00'),
('Northern Pines Mental Health Center Inc Provider', TRUE, FALSE, '520 5th Street Northwest', 'Brainerd', 'MN', 56401, 'http://www.npmh.org/', NULL, '218-892-3235', NULL, '2026-06-10 00:00:00'),
('Northern Pines Mental Health Center Inc Provider', TRUE, FALSE, '1906 5th Avenue SE', 'Little Falls', 'MN', 56345, 'http://www.npmh.org/', NULL, '320-639-2025', NULL, '2026-06-10 00:00:00'),
('Northern Pines Mental Health Center Inc Provider', TRUE, FALSE, '16 9th Ave SE', 'Long Prairie', 'MN', 56347, 'http://www.npmh.org/', NULL, '320-639-2025', NULL, '2026-06-10 00:00:00'),
('Northern Pines Mental Health Center Inc Provider', TRUE, FALSE, '11 2nd St W', 'Wadena', 'MN', 56482, 'http://www.npmh.org/', NULL, '320-639-2025', NULL, '2026-06-10 00:00:00'),
('Northland Counseling Center - Grand Rapids', FALSE, FALSE, '215 SE 2nd Avenue', 'Grand Rapids', 'MN', 55744, 'https://northlandcounseling.org/mental-health/dialectical-behavior-therapy/', NULL, '218-326-1274', NULL, '2026-08-31 00:00:00'),
('Northland Counseling Center - International Falls', FALSE, FALSE, '900 5th Street Suite 305', 'International Falls', 'MN', 56649, 'http://northlandcounselingifalls.org/', NULL, '218-283-3406', NULL, '2026-08-31 00:00:00'),
('Northland Counseling Center - Grand Rapids', FALSE, FALSE, '3130 SE 2nd Ave', 'Grand Rapids', 'MN', 55744, 'http://northlandcounselingifalls.org/', NULL, '218-283-3406', NULL, '2026-08-31 00:00:00'),
('Northland Counseling Center - International Falls', FALSE, FALSE, '1902 Valley Pine Circle', 'International Falls', 'MN', 56649, 'http://northlandcounselingifalls.org/', NULL, '218-283-3406', NULL, '2026-08-31 00:00:00'),
('Nystrom and Associates Ltd', FALSE, TRUE, '1101 East 78th Street Suite 100', 'Bloomington', 'MN', 55420, 'https://www.nystromcounseling.com/our-services/dialectical-behavior-therapy/', NULL, '952-854-5034', NULL, '2026-12-12 00:00:00'),
('Nystrom and Associates Ltd Provider', TRUE, TRUE, '11660 Round Lake Boulevard Northwest', 'Coon Rapids', 'MN', 55433, 'https://www.nystromcounseling.com/our-services/dialectical-behavior-therapy/', NULL, '763-767-3350', NULL, '2026-12-12 00:00:00'),
('Nystrom and Associates Ltd', FALSE, FALSE, '332 West Superior StreetSuite 300', 'Duluth', 'MN', 55802, 'https://www.nystromcounseling.com/our-services/dialectical-behavior-therapy/', NULL, '218-722-4379', NULL, '2026-12-12 00:00:00'),
('Nystrom and Associates Ltd Provider', TRUE, FALSE, '11010 Prairie Lakes Drive Suite 350', 'Eden Prairie', 'MN', 55344, 'https://www.nystromcounseling.com/our-services/dialectical-behavior-therapy/', NULL, '952-746-2522', NULL, '2026-12-12 00:00:00'),
('Nystrom and Associates Ltd Provider', TRUE, TRUE, '17685 Juniper Path Suite 303', 'Lakeville', 'MN', 55044, 'https://www.nystromcounseling.com/our-services/dialectical-behavior-therapy/', NULL, '952-214-8959', NULL, '2026-04-06 00:00:00'),
('Nystrom and Associates Ltd Provider', TRUE, FALSE, '201 North Broad Street', 'Mankato', 'MN', 56011, 'https://www.nystromcounseling.com/our-services/dialectical-behavior-therapy-dbt/', NULL, '507-225-1500', NULL, '2025-06-30 00:00:00'),
('Nystrom and Associates Ltd Provider', TRUE, FALSE, '13603 80th Circle North', 'Maple Grove', 'MN', 55369, 'https://www.nystromcounseling.com/our-services/dialectical-behavior-therapy/', NULL, '763-274-3120', NULL, '2026-12-12 00:00:00'),
('Nystrom and Associates Ltd', FALSE, FALSE, '13100 Wayzata Boulevard Suite 200', 'Minnetonka', 'MN', 55305, 'https://www.nystromcounseling.com/', NULL, '952-206-2040', NULL, '2026-12-12 00:00:00'),
('Nystrom and Associates Ltd Provider', TRUE, FALSE, '1900 Silver Lake Road Suite 110', 'New Brighton', 'MN', 55112, 'https://www.nystromcounseling.com/our-services/dialectical-behavior-therapy/', NULL, '651-628-9566', NULL, '2026-12-12 00:00:00'),
('Nystrom and Associates Ltd', FALSE, FALSE, '9245 Quantrelle Avenue', 'Otsego', 'MN', 55330, 'https://www.nystromcounseling.com/our-services/dialectical-behavior-therapy/', NULL, '763-746-9492', NULL, '2026-12-12 00:00:00'),
('Nystrom and Associates Ltd Provider', TRUE, FALSE, '101 Delher Drive', 'St. Cloud', 'MN', 56377, 'https://www.nystromcounseling.com/our-services/dialectical-behavior-therapy/', NULL, '320-253-3512', NULL, '2026-12-12 00:00:00'),
('Nystrom and Associates Ltd Provider', TRUE, FALSE, '1811 Weir Drive Suite 270', 'Woodbury', 'MN', '55125', 'https://www.nystromcounseling.com/our-locations/minnesota/woodbury-clinic/', NULL, '651-714-9646', NULL, '2026-12-12'),
('Nystrom and Associates Ltd', FALSE, FALSE, '2405 8th Street SouthSuite 200', 'Moorhead', 'MN', '56560', 'https://www.nystromcounseling.com/our-services/dialectical-behavior-therapy/', NULL, '952-997-3020', NULL, '2026-12-12'),
('Olmsted County DBT Program', FALSE, FALSE, '2100 Campus Drive Southeast Suite 200', 'Rochester', 'MN', '55904', 'https://www.olmstedcounty.gov/residents/services-individuals-families/adults-seniors/adult-behavioral-health#considering-dbt4', NULL, '507-328-6400', NULL, '2026-06-05'),
('Omni Mental Health', FALSE, TRUE, '245 Ruth Street North Suite 101', 'St Paul', 'MN', '55119', 'https://www.omnimentalhealth.com/', NULL, '651-955-4633', NULL, '2026-08-31'),
('Omni Mental Health', FALSE, FALSE, '9298 Central Ave NE Suite 310', 'Blaine', 'MN', '55434', 'https://www.omnimentalhealth.com/', NULL, '651-955-4633', NULL, '2026-08-31'),
('Omni Mental Health', FALSE, FALSE, '268 S Main St', 'Zumbrota', 'MN', '55992', 'https://www.omnimentalhealth.com/', NULL, '651-955-4633', NULL, '2026-08-31'),
('Omni Mental Health', FALSE, FALSE, '2 N Minnesota St', 'New Ulm', 'MN', '56073', 'https://www.omnimentalhealth.com/', NULL, '651-955-4633', NULL, '2026-08-31'),
('Parker Collins Family Mental Health', TRUE, FALSE, '1056 Centerville Circle', 'Vadnais Heights', 'MN', '55127', 'https://parkercollins.com/', NULL, '615-604-7771', NULL, '2026-02-17'),
('Psych Recovery Inc', FALSE, FALSE, '2550 University Ave West Suite 229N', 'St Paul', 'MN', '55114', 'http://www.psychrecoveryinc.com/dbt.html', NULL, '651-645-3115', NULL, '2028-09-21'),
('RADIAS Health Provider', TRUE, FALSE, '166 4th Street East', 'St Paul', 'MN', '55101', 'http://www.south-metro.org/programs/', NULL, '651-389-4690', NULL, '2026-04-20'),
('Riverstone Psychological Services Inc. Provider', TRUE, FALSE, '511 Northern Hills Drive Northeast Suite 2', 'Rochester', 'MN', '55906', 'https://www.riverstonepsych.com/', NULL, '507-696-2523', NULL, '2024-12-16'),
('Schmidt Counseling Services Inc dba Southbridge Counseling Associates', FALSE, FALSE, '8646 Eagle Creek Circle Suite 213', 'Savage', 'MN', '55378', 'http://www.southbridgecounseling.com/', NULL, '952-583-1055', NULL, '2024-11-03'),
('Secure Base Counseling Center Provider', TRUE, FALSE, '570 Professional Drive', 'Northfield', 'MN', '55057', 'https://www.securebasecounselingcenter.com/', NULL, '507-301-3412', NULL, '2026-05-26'),
('Secure Base Counseling Center Provider', TRUE, FALSE, '213 First St', 'Farmington', 'MN', '55024', 'https://www.securebasecounselingcenter.com/', NULL, '507-301-3412', NULL, '2026-05-26'),
('Secure Base Counseling Center Provider', TRUE, TRUE, '301 E Main St', 'New Prague', 'MN', '56071', 'https://www.securebasecounselingcenter.com/', NULL, '507-301-3412', NULL, '2026-05-26'),
('Solutions Behavioral Health Center', FALSE, FALSE, '891 Belsly Boulevard', 'Moorhead', 'MN', '56560', 'https://www.solutionsinpractice.org/', NULL, '218-287-4338', NULL, '2026-08-31'),
('Solutions Behavioral Health Center', FALSE, FALSE, '1104 West River Road', 'Detroit Lakes', 'MN', '56051', 'https://www.solutionsinpractice.org/', NULL, '218-844-6853', NULL, '2026-08-31'),
('Solutions Behavioral Health Center', FALSE, FALSE, '1806 Fir Avenue E Suite 200', 'Fergus Falls', 'MN', '56537', 'https://www.solutionsinpractice.org/', NULL, '218-988-2992', NULL, '2026-08-31'),
('Solutions Behavioral Health Center', FALSE, FALSE, '423 Great Oak Dr', 'Waite Park', 'MN', '56387', 'https://www.solutionsinpractice.org/', NULL, '320-281-5305', NULL, '2026-08-31'),
('Tiny Tree Counseling & Consulting LLC', FALSE, TRUE, '3950 Lyndale Ave S Suite 2', 'Minneapolis', 'MN', '55409', 'https://www.tinytreecounseling.com/', 'tiny-tree-counseling.png', '833-482-5546', 'support@tinytreecounseling.com', '2025-03-04'),
('Tubman Chrysalis Center', FALSE, FALSE, '4432 Chicago Avenue South', 'Minneapolis', 'MN', '55407', 'https://www.tubman.org/', NULL, '612-870-2426', NULL, '2024-05-07'),
('Volunteers of America of MN Mental Health Clinic dba Vona Center for Mental Health by Volunteers of America of MN Provider', TRUE, TRUE, '9220 Bass Lake Road Suite 255', 'New Hope', 'MN', '55422', 'http://www.voamnwi.org/dbt-outpatient-therapy', NULL, '763-225-4029', NULL, '2026-08-31'),
('Washburn Center for Children', FALSE, FALSE, '1100 Glenwood Ave', 'Minneapolis', 'MN', '55405', 'https://washburn.org/', NULL, '612-871-1454', NULL, '2025-06-26'),
('Western Mental Health Clinic Provider', TRUE, FALSE, '1212 East College Drive', 'Marshall', 'MN', '56258', 'http://wmhcinc.org/', NULL, '507-532-3236', NULL, '2026-07-31'),
('Western Mental Health Clinic Provider', TRUE, TRUE, '112 St. Olaf Ave S', 'Canby', 'MN', '56220', 'http://wmhcinc.org/', NULL, '800-658-2429', NULL, '2026-07-31'),
('Western Mental Health Clinic Provider', TRUE, TRUE, '818 Prentice Drive', 'Granite Falls', 'MN', '56241', 'http://wmhcinc.org/', NULL, '800-658-2449', NULL, '2026-07-31'),
('Western Mental Health Clinic Provider', TRUE, TRUE, '2001 Maple St', 'Slayton', 'MN', '56172', 'http://wmhcinc.org/', NULL, '800-658-2249', NULL, '2026-07-31'),
('Western Mental Health Clinic Provider', TRUE, FALSE, '101 Caring Way', 'Redwood Falls', 'MN', '56283', 'http://wmhcinc.org/', NULL, '507-532-3236', NULL, '2026-07-31'),
('Western Mental Health Clinic Provider', TRUE, FALSE, '2042 Juniper Drive', 'Slayton', 'MN', '56172', 'http://wmhcinc.org/', NULL, '800-658-2429', NULL, '2026-07-31'),
('Western Mental Health Clinic Provider', TRUE, FALSE, '240 Willow St', 'Tyler', 'MN', '56178', 'http://wmhcinc.org/', NULL, '800-658-2429', NULL, '2026-07-31'),
('Wholehearted Healing LLC', FALSE, FALSE, '6381 Osgood Ave North Building C', 'Stillwater', 'MN', '55082', 'https://www.wholeheartedhealingllc.com/', NULL, '612-217-1560', NULL, '2025-07-18');
