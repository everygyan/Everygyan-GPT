-- ==============================================================================
-- EveryGyan Migration: Content Templates (Travel & Learning / Tutorial)
-- File: 20261020000003_content_templates.sql
-- ==============================================================================

-- 1. Add template_type and template_data to public.articles
ALTER TABLE public.articles 
  ADD COLUMN IF NOT EXISTS template_type text NOT NULL DEFAULT 'standard'
  CHECK (template_type IN ('standard', 'travel', 'tutorial'));

ALTER TABLE public.articles 
  ADD COLUMN IF NOT EXISTS template_data jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 2. Index for filtering by template type
CREATE INDEX IF NOT EXISTS idx_articles_template_type ON public.articles(template_type);

-- 3. Populate existing travel article with structured travel guide template data
UPDATE public.articles
SET 
  template_type = 'travel',
  template_data = jsonb_build_object(
    'destination', 'Central Europe (Austria, Czech Republic, Switzerland)',
    'best_time_to_visit', jsonb_build_object(
      'season', 'May to September & December',
      'note', 'Late spring and summer are optimal for alpine lake excursions; December offers world-renowned holiday markets. Always verify local seasonal hours.',
      'verified_date', 'October 2026'
    ),
    'transport', jsonb_build_object(
      'arrival', 'International flights into Vienna International (VIE) or Zurich Airport (ZRH).',
      'local_transit', 'Integrated Eurail and Swiss Travel Pass (SBB) network with regional cogwheel trains.',
      'tip', 'Book long-distance OBB Railjet and SBB seat reservations at least 2 weeks in advance during summer.'
    ),
    'budget_ranges', jsonb_build_object(
      'currency', 'EUR / CHF',
      'daily_budget', '€85 - €160 / day',
      'verified_date', 'October 2026',
      'notes', 'Estimated mid-range family daily spend covering regional transit cards, museum family tickets, and local dining.'
    ),
    'family_accessibility', jsonb_build_object(
      'family_friendly', true,
      'accessibility_notes', 'All major Austrian and Swiss central rail stations provide step-free access, dedicated elevators, and family quiet compartments.'
    ),
    'itinerary', jsonb_build_array(
      jsonb_build_object(
        'day', 'Days 1-2',
        'title', 'Vienna Imperial Parks & Prater',
        'activities', jsonb_build_array('Schönbrunn Palace gardens & children pavilion', 'Historic Prater Riesenrad giant ferris wheel', 'Interactive Haus der Musik sound museum')
      ),
      jsonb_build_object(
        'day', 'Days 3-4',
        'title', 'Hallstatt Alpine Lakes & Historic Salt Mine',
        'activities', jsonb_build_array('Electric boat cruise on mirror-like Lake Hallstatt', 'Salzwelten funicular ascent and subterranean wooden miners slide', 'Skywalk World Heritage viewpoint')
      ),
      jsonb_build_object(
        'day', 'Days 5-7',
        'title', 'Interlaken & Bernese Oberland',
        'activities', jsonb_build_array('Cogwheel railway to Jungfraujoch Top of Europe', 'Lake Brienz scenic historic paddle-steamer', 'Family walking trail from First to Bachalpsee')
      )
    ),
    'maps_links', jsonb_build_array(
      jsonb_build_object('title', 'Austrian National Tourist Office Official Portal', 'url', 'https://www.austria.info'),
      jsonb_build_object('title', 'Swiss Federal Railways (SBB) Family Travel Information', 'url', 'https://www.sbb.ch')
    ),
    'safety_caveats', 'Ensure all travel passports have at least 6 months remaining validity before entering the Schengen area. Verify visa eligibility and comprehensive health/trip cancellation coverage before booking.'
  )
WHERE slug = '10-amazing-places-to-visit-in-europe-with-family';

-- 4. Populate existing learning article with structured tutorial template data
UPDATE public.articles
SET 
  template_type = 'tutorial',
  template_data = jsonb_build_object(
    'version_applicability', 'SAP S/4HANA 2023 / Cloud 2402, ABAP RESTful Application Programming Model (RAP)',
    'difficulty_level', 'Intermediate',
    'prerequisites', jsonb_build_array(
      'Basic familiarity with relational database schema and SQL syntax',
      'Active developer tenant or access to SAP BTP Free Tier / SAP S/4HANA Trial System',
      'Eclipse IDE with ABAP Development Tools (ADT) plugin installed and configured'
    ),
    'learning_objectives', jsonb_build_array(
      'Understand the architectural shift from legacy ERP table queries to CDS views',
      'Build and activate a Core Data Services (CDS) Data Definition in Eclipse ADT',
      'Expose CDS views via an OData V4 Service Binding and test live with SAP Fiori Preview'
    ),
    'steps', jsonb_build_array(
      jsonb_build_object(
        'step_number', 1,
        'title', 'Connect Eclipse ADT to your SAP S/4HANA ABAP Backend',
        'instructions', 'Open Eclipse IDE with the ADT plugin installed. Select File > New > ABAP Project. Select your SAP system from SAP Logon or enter the system host details, client (e.g., 100), user, and password.',
        'tip', 'Verify that your user has developer authorization object S_DEVELOP assigned in transaction SU01.'
      ),
      jsonb_build_object(
        'step_number', 2,
        'title', 'Create your Core Data Services (CDS) Data Definition',
        'instructions', 'In the Project Explorer, expand your development package. Right-click Core Data Services > Data Definitions > New Data Definition. Give it a name such as ZI_FlightDemo and enter a descriptive label.',
        'code_snippet', '@AbapCatalog.sqlViewName: ''ZV_FLIGHT_DEMO''' || E'\n' ||
'@AbapCatalog.compiler.compareFilter: true' || E'\n' ||
'@AccessControl.authorizationCheck: #CHECK' || E'\n' ||
'@EndUserText.label: ''Flight Data Definition''' || E'\n' ||
'define view ZI_FlightDemo as select from sflight {' || E'\n' ||
'  key carrid as CarrierId,' || E'\n' ||
'  key connid as ConnectionId,' || E'\n' ||
'  key fldate as FlightDate,' || E'\n' ||
'  price      as Price,' || E'\n' ||
'  currency   as CurrencyCode,' || E'\n' ||
'  planetype  as PlaneType' || E'\n' ||
'}',
        'tip', 'Press Ctrl+F3 to activate the CDS view. Review Problems tab to ensure zero syntax warnings.'
      ),
      jsonb_build_object(
        'step_number', 3,
        'title', 'Expose as OData V4 Service & Preview in SAP Fiori',
        'instructions', 'Right-click your newly activated CDS view > New Business Services > Service Definition. Expose entity ZI_FlightDemo. Next, right-click the Service Definition and select New Service Binding with Binding Type "OData V4 - UI". Click Activate then Publish.',
        'tip', 'Select the exposed entity in the Service Binding and double-click to launch the browser-based Fiori Elements Preview.'
      )
    ),
    'troubleshooting', jsonb_build_array(
      jsonb_build_object(
        'issue', 'Package $TMP is not transportable',
        'resolution', 'Local package $TMP is restricted to temporary prototyping. For permanent development, assign an approved transportable workbench request with package starting with Z or Y.'
      ),
      jsonb_build_object(
        'issue', 'HTTP 403 Forbidden when publishing Service Binding',
        'resolution', 'Verify user authorizations in SAP transaction /IWFND/MAINT_SERVICE and ensure your developer profile includes authorization object /IWFND/AUTH.'
      )
    ),
    'related_lessons', jsonb_build_array(
      jsonb_build_object('title', 'Introduction to SAP Fiori Elements Floorplans', 'url_or_slug', 'why-learning-sap-can-boost-your-career')
    )
  )
WHERE slug = 'why-learning-sap-can-boost-your-career';
