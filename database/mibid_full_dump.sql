--
-- PostgreSQL database dump
--

\restrict vS4fA8ZhBWHX58CAW7ezdxaTd44cQ67EKDh2u2pW1ggcAshYhEbCgxLPtzCagdj

-- Dumped from database version 15.18
-- Dumped by pg_dump version 15.18

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP POLICY IF EXISTS tenant_isolation_policy ON public.workflows;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.workflow_versions;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.workflow_transitions;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.workflow_stages;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.workflow_stage_tasks;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.users;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.user_sessions;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.system_settings;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.stage_notifications;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.stage_doc_rules;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.stage_checklist_items;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.shipments;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.shipment_milestones;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.shipment_costs;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.roles;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.rfqs;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.rfq_vendors;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.rfq_line_items;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.rfq_evaluation_criteria;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.quotations;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.quotation_line_items;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.projects;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.project_transition_logs;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.project_tasks;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.project_members;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.project_documents;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.project_comments;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.project_checklist_status;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.notifications;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.magic_links;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.file_attachments;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.document_audit_logs;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.doc_types;
DROP POLICY IF EXISTS tenant_isolation_policy ON public.activity_logs;
ALTER TABLE IF EXISTS ONLY public.stage_checklist_items DROP CONSTRAINT IF EXISTS stage_checklist_items_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.workflow_versions DROP CONSTRAINT IF EXISTS fk_wv_workflow;
ALTER TABLE IF EXISTS ONLY public.workflow_versions DROP CONSTRAINT IF EXISTS fk_wv_tenant;
ALTER TABLE IF EXISTS ONLY public.workflow_versions DROP CONSTRAINT IF EXISTS fk_wv_publisher;
ALTER TABLE IF EXISTS ONLY public.workflow_transitions DROP CONSTRAINT IF EXISTS fk_wt_workflow;
ALTER TABLE IF EXISTS ONLY public.workflow_transitions DROP CONSTRAINT IF EXISTS fk_wt_version;
ALTER TABLE IF EXISTS ONLY public.workflow_transitions DROP CONSTRAINT IF EXISTS fk_wt_to;
ALTER TABLE IF EXISTS ONLY public.workflow_transitions DROP CONSTRAINT IF EXISTS fk_wt_tenant;
ALTER TABLE IF EXISTS ONLY public.workflow_transitions DROP CONSTRAINT IF EXISTS fk_wt_from;
ALTER TABLE IF EXISTS ONLY public.workflow_stage_tasks DROP CONSTRAINT IF EXISTS fk_wst_tenant;
ALTER TABLE IF EXISTS ONLY public.workflow_stage_tasks DROP CONSTRAINT IF EXISTS fk_wst_stage;
ALTER TABLE IF EXISTS ONLY public.workflow_stage_tasks DROP CONSTRAINT IF EXISTS fk_wst_depends;
ALTER TABLE IF EXISTS ONLY public.workflows DROP CONSTRAINT IF EXISTS fk_workflows_tenant;
ALTER TABLE IF EXISTS ONLY public.workflows DROP CONSTRAINT IF EXISTS fk_workflows_creator;
ALTER TABLE IF EXISTS ONLY public.workflow_stages DROP CONSTRAINT IF EXISTS fk_wfstages_workflow;
ALTER TABLE IF EXISTS ONLY public.workflow_stages DROP CONSTRAINT IF EXISTS fk_wfstages_version;
ALTER TABLE IF EXISTS ONLY public.workflow_stages DROP CONSTRAINT IF EXISTS fk_wfstages_tenant;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS fk_users_tenant;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS fk_users_role;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS fk_users_manager;
ALTER TABLE IF EXISTS ONLY public.user_sessions DROP CONSTRAINT IF EXISTS fk_us_user;
ALTER TABLE IF EXISTS ONLY public.user_sessions DROP CONSTRAINT IF EXISTS fk_us_tenant;
ALTER TABLE IF EXISTS ONLY public.tenant_subscriptions DROP CONSTRAINT IF EXISTS fk_ts_plan;
ALTER TABLE IF EXISTS ONLY public.system_settings DROP CONSTRAINT IF EXISTS fk_ss_updater;
ALTER TABLE IF EXISTS ONLY public.system_settings DROP CONSTRAINT IF EXISTS fk_ss_tenant;
ALTER TABLE IF EXISTS ONLY public.stage_notifications DROP CONSTRAINT IF EXISTS fk_sn_tenant;
ALTER TABLE IF EXISTS ONLY public.stage_notifications DROP CONSTRAINT IF EXISTS fk_sn_stage;
ALTER TABLE IF EXISTS ONLY public.shipment_milestones DROP CONSTRAINT IF EXISTS fk_sm_updater;
ALTER TABLE IF EXISTS ONLY public.shipment_milestones DROP CONSTRAINT IF EXISTS fk_sm_tenant;
ALTER TABLE IF EXISTS ONLY public.shipment_milestones DROP CONSTRAINT IF EXISTS fk_sm_shipment;
ALTER TABLE IF EXISTS ONLY public.shipment_milestones DROP CONSTRAINT IF EXISTS fk_sm_completer;
ALTER TABLE IF EXISTS ONLY public.saas_features DROP CONSTRAINT IF EXISTS fk_sf_module;
ALTER TABLE IF EXISTS ONLY public.stage_doc_rules DROP CONSTRAINT IF EXISTS fk_sdr_tenant;
ALTER TABLE IF EXISTS ONLY public.stage_doc_rules DROP CONSTRAINT IF EXISTS fk_sdr_stage;
ALTER TABLE IF EXISTS ONLY public.stage_doc_rules DROP CONSTRAINT IF EXISTS fk_sdr_doc_type;
ALTER TABLE IF EXISTS ONLY public.stage_checklist_items DROP CONSTRAINT IF EXISTS fk_sci_tenant;
ALTER TABLE IF EXISTS ONLY public.stage_checklist_items DROP CONSTRAINT IF EXISTS fk_sci_stage;
ALTER TABLE IF EXISTS ONLY public.shipment_costs DROP CONSTRAINT IF EXISTS fk_sc_tenant;
ALTER TABLE IF EXISTS ONLY public.shipment_costs DROP CONSTRAINT IF EXISTS fk_sc_shipment;
ALTER TABLE IF EXISTS ONLY public.shipment_costs DROP CONSTRAINT IF EXISTS fk_sc_creator;
ALTER TABLE IF EXISTS ONLY public.shipments DROP CONSTRAINT IF EXISTS fk_s_tenant;
ALTER TABLE IF EXISTS ONLY public.shipments DROP CONSTRAINT IF EXISTS fk_s_project;
ALTER TABLE IF EXISTS ONLY public.shipments DROP CONSTRAINT IF EXISTS fk_s_creator;
ALTER TABLE IF EXISTS ONLY public.shipments DROP CONSTRAINT IF EXISTS fk_s_assignee;
ALTER TABLE IF EXISTS ONLY public.rfq_vendors DROP CONSTRAINT IF EXISTS fk_rv_tenant;
ALTER TABLE IF EXISTS ONLY public.rfq_vendors DROP CONSTRAINT IF EXISTS fk_rv_rfq;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS fk_rp_role;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS fk_roles_tenant;
ALTER TABLE IF EXISTS ONLY public.rfq_line_items DROP CONSTRAINT IF EXISTS fk_rli_tenant;
ALTER TABLE IF EXISTS ONLY public.rfq_line_items DROP CONSTRAINT IF EXISTS fk_rli_rfq;
ALTER TABLE IF EXISTS ONLY public.rfqs DROP CONSTRAINT IF EXISTS fk_rfqs_tenant;
ALTER TABLE IF EXISTS ONLY public.rfqs DROP CONSTRAINT IF EXISTS fk_rfqs_project;
ALTER TABLE IF EXISTS ONLY public.rfqs DROP CONSTRAINT IF EXISTS fk_rfqs_parent;
ALTER TABLE IF EXISTS ONLY public.rfqs DROP CONSTRAINT IF EXISTS fk_rfqs_creator;
ALTER TABLE IF EXISTS ONLY public.rfqs DROP CONSTRAINT IF EXISTS fk_rfqs_approver;
ALTER TABLE IF EXISTS ONLY public.rfq_evaluation_criteria DROP CONSTRAINT IF EXISTS fk_rec_tenant;
ALTER TABLE IF EXISTS ONLY public.rfq_evaluation_criteria DROP CONSTRAINT IF EXISTS fk_rec_rfq;
ALTER TABLE IF EXISTS ONLY public.quotation_line_items DROP CONSTRAINT IF EXISTS fk_qli_tenant;
ALTER TABLE IF EXISTS ONLY public.quotation_line_items DROP CONSTRAINT IF EXISTS fk_qli_rfq_item;
ALTER TABLE IF EXISTS ONLY public.quotation_line_items DROP CONSTRAINT IF EXISTS fk_qli_quotation;
ALTER TABLE IF EXISTS ONLY public.quotations DROP CONSTRAINT IF EXISTS fk_q_tenant;
ALTER TABLE IF EXISTS ONLY public.quotations DROP CONSTRAINT IF EXISTS fk_q_rfq_vendor;
ALTER TABLE IF EXISTS ONLY public.quotations DROP CONSTRAINT IF EXISTS fk_q_rfq;
ALTER TABLE IF EXISTS ONLY public.quotations DROP CONSTRAINT IF EXISTS fk_q_magic_link;
ALTER TABLE IF EXISTS ONLY public.quotations DROP CONSTRAINT IF EXISTS fk_q_approver;
ALTER TABLE IF EXISTS ONLY public.project_transition_logs DROP CONSTRAINT IF EXISTS fk_ptl_user;
ALTER TABLE IF EXISTS ONLY public.project_transition_logs DROP CONSTRAINT IF EXISTS fk_ptl_transition;
ALTER TABLE IF EXISTS ONLY public.project_transition_logs DROP CONSTRAINT IF EXISTS fk_ptl_to;
ALTER TABLE IF EXISTS ONLY public.project_transition_logs DROP CONSTRAINT IF EXISTS fk_ptl_tenant;
ALTER TABLE IF EXISTS ONLY public.project_transition_logs DROP CONSTRAINT IF EXISTS fk_ptl_project;
ALTER TABLE IF EXISTS ONLY public.project_transition_logs DROP CONSTRAINT IF EXISTS fk_ptl_from;
ALTER TABLE IF EXISTS ONLY public.project_tasks DROP CONSTRAINT IF EXISTS fk_pt_tenant;
ALTER TABLE IF EXISTS ONLY public.project_tasks DROP CONSTRAINT IF EXISTS fk_pt_template;
ALTER TABLE IF EXISTS ONLY public.project_tasks DROP CONSTRAINT IF EXISTS fk_pt_stage;
ALTER TABLE IF EXISTS ONLY public.project_tasks DROP CONSTRAINT IF EXISTS fk_pt_reviewer;
ALTER TABLE IF EXISTS ONLY public.project_tasks DROP CONSTRAINT IF EXISTS fk_pt_project;
ALTER TABLE IF EXISTS ONLY public.project_tasks DROP CONSTRAINT IF EXISTS fk_pt_parent;
ALTER TABLE IF EXISTS ONLY public.project_tasks DROP CONSTRAINT IF EXISTS fk_pt_creator;
ALTER TABLE IF EXISTS ONLY public.project_tasks DROP CONSTRAINT IF EXISTS fk_pt_assignee;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS fk_projects_workflow;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS fk_projects_wf_version;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS fk_projects_tenant;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS fk_projects_stage;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS fk_projects_creator;
ALTER TABLE IF EXISTS ONLY public.project_members DROP CONSTRAINT IF EXISTS fk_pm_user;
ALTER TABLE IF EXISTS ONLY public.project_members DROP CONSTRAINT IF EXISTS fk_pm_tenant;
ALTER TABLE IF EXISTS ONLY public.project_members DROP CONSTRAINT IF EXISTS fk_pm_project;
ALTER TABLE IF EXISTS ONLY public.project_members DROP CONSTRAINT IF EXISTS fk_pm_added_by;
ALTER TABLE IF EXISTS ONLY public.plan_features DROP CONSTRAINT IF EXISTS fk_pf_feature;
ALTER TABLE IF EXISTS ONLY public.project_documents DROP CONSTRAINT IF EXISTS fk_pd_uploader;
ALTER TABLE IF EXISTS ONLY public.project_documents DROP CONSTRAINT IF EXISTS fk_pd_tenant;
ALTER TABLE IF EXISTS ONLY public.project_documents DROP CONSTRAINT IF EXISTS fk_pd_reviewer;
ALTER TABLE IF EXISTS ONLY public.project_documents DROP CONSTRAINT IF EXISTS fk_pd_project;
ALTER TABLE IF EXISTS ONLY public.project_documents DROP CONSTRAINT IF EXISTS fk_pd_parent;
ALTER TABLE IF EXISTS ONLY public.project_documents DROP CONSTRAINT IF EXISTS fk_pd_doc_type;
ALTER TABLE IF EXISTS ONLY public.project_checklist_status DROP CONSTRAINT IF EXISTS fk_pcs_user;
ALTER TABLE IF EXISTS ONLY public.project_checklist_status DROP CONSTRAINT IF EXISTS fk_pcs_project;
ALTER TABLE IF EXISTS ONLY public.project_checklist_status DROP CONSTRAINT IF EXISTS fk_pcs_item;
ALTER TABLE IF EXISTS ONLY public.project_comments DROP CONSTRAINT IF EXISTS fk_pc_tenant;
ALTER TABLE IF EXISTS ONLY public.project_comments DROP CONSTRAINT IF EXISTS fk_pc_project;
ALTER TABLE IF EXISTS ONLY public.project_comments DROP CONSTRAINT IF EXISTS fk_pc_parent;
ALTER TABLE IF EXISTS ONLY public.project_comments DROP CONSTRAINT IF EXISTS fk_pc_author;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS fk_n_tenant;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS fk_n_recipient;
ALTER TABLE IF EXISTS ONLY public.magic_links DROP CONSTRAINT IF EXISTS fk_ml_vendor;
ALTER TABLE IF EXISTS ONLY public.magic_links DROP CONSTRAINT IF EXISTS fk_ml_tenant;
ALTER TABLE IF EXISTS ONLY public.magic_links DROP CONSTRAINT IF EXISTS fk_ml_rfq;
ALTER TABLE IF EXISTS ONLY public.file_attachments DROP CONSTRAINT IF EXISTS fk_fa_uploader;
ALTER TABLE IF EXISTS ONLY public.file_attachments DROP CONSTRAINT IF EXISTS fk_fa_tenant;
ALTER TABLE IF EXISTS ONLY public.doc_types DROP CONSTRAINT IF EXISTS fk_doc_types_tenant;
ALTER TABLE IF EXISTS ONLY public.document_audit_logs DROP CONSTRAINT IF EXISTS fk_dal_user;
ALTER TABLE IF EXISTS ONLY public.document_audit_logs DROP CONSTRAINT IF EXISTS fk_dal_tenant;
ALTER TABLE IF EXISTS ONLY public.document_audit_logs DROP CONSTRAINT IF EXISTS fk_dal_doc;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS fk_al_user;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS fk_al_tenant;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS fk_al_project;
DROP TRIGGER IF EXISTS trg_workflows_updated_at ON public.workflows;
DROP TRIGGER IF EXISTS trg_workflow_versions_updated_at ON public.workflow_versions;
DROP TRIGGER IF EXISTS trg_workflow_stages_updated_at ON public.workflow_stages;
DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS trg_transition_duration ON public.project_transition_logs;
DROP TRIGGER IF EXISTS trg_tenants_updated_at ON public.tenants;
DROP TRIGGER IF EXISTS trg_tenant_subscriptions_updated_at ON public.tenant_subscriptions;
DROP TRIGGER IF EXISTS trg_system_settings_updated_at ON public.system_settings;
DROP TRIGGER IF EXISTS trg_shipments_updated_at ON public.shipments;
DROP TRIGGER IF EXISTS trg_shipment_milestones_updated_at ON public.shipment_milestones;
DROP TRIGGER IF EXISTS trg_shipment_costs_updated_at ON public.shipment_costs;
DROP TRIGGER IF EXISTS trg_roles_updated_at ON public.roles;
DROP TRIGGER IF EXISTS trg_rfqs_updated_at ON public.rfqs;
DROP TRIGGER IF EXISTS trg_rfq_line_items_updated_at ON public.rfq_line_items;
DROP TRIGGER IF EXISTS trg_quotations_updated_at ON public.quotations;
DROP TRIGGER IF EXISTS trg_quotation_line_items_updated_at ON public.quotation_line_items;
DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
DROP TRIGGER IF EXISTS trg_project_tasks_updated_at ON public.project_tasks;
DROP TRIGGER IF EXISTS trg_project_documents_updated_at ON public.project_documents;
DROP TRIGGER IF EXISTS trg_milestone_delay ON public.shipment_milestones;
DROP TRIGGER IF EXISTS trg_doc_types_updated_at ON public.doc_types;
DROP INDEX IF EXISTS public.idx_wv_workflow;
DROP INDEX IF EXISTS public.idx_wt_workflow;
DROP INDEX IF EXISTS public.idx_wt_to;
DROP INDEX IF EXISTS public.idx_wt_from;
DROP INDEX IF EXISTS public.idx_wst_stage;
DROP INDEX IF EXISTS public.idx_wfstages_workflow;
DROP INDEX IF EXISTS public.idx_wfstages_version;
DROP INDEX IF EXISTS public.idx_users_role_id;
DROP INDEX IF EXISTS public.idx_users_manager;
DROP INDEX IF EXISTS public.idx_users_email;
DROP INDEX IF EXISTS public.idx_users_department;
DROP INDEX IF EXISTS public.idx_us_user;
DROP INDEX IF EXISTS public.idx_us_token;
DROP INDEX IF EXISTS public.idx_us_active;
DROP INDEX IF EXISTS public.idx_sn_stage;
DROP INDEX IF EXISTS public.idx_sm_shipment;
DROP INDEX IF EXISTS public.idx_sm_planned;
DROP INDEX IF EXISTS public.idx_sm_overdue;
DROP INDEX IF EXISTS public.idx_sci_stage;
DROP INDEX IF EXISTS public.idx_sci_project_stage;
DROP INDEX IF EXISTS public.idx_sc_shipment;
DROP INDEX IF EXISTS public.idx_s_status;
DROP INDEX IF EXISTS public.idx_s_project;
DROP INDEX IF EXISTS public.idx_s_booking;
DROP INDEX IF EXISTS public.idx_s_bl;
DROP INDEX IF EXISTS public.idx_rv_status;
DROP INDEX IF EXISTS public.idx_rv_rfq;
DROP INDEX IF EXISTS public.idx_rv_invitation_code;
DROP INDEX IF EXISTS public.idx_rli_rfq;
DROP INDEX IF EXISTS public.idx_rli_hs_code;
DROP INDEX IF EXISTS public.idx_rfqs_status;
DROP INDEX IF EXISTS public.idx_rfqs_project;
DROP INDEX IF EXISTS public.idx_rfqs_parent;
DROP INDEX IF EXISTS public.idx_rfqs_deadline;
DROP INDEX IF EXISTS public.idx_rec_rfq;
DROP INDEX IF EXISTS public.idx_qli_rfq_item;
DROP INDEX IF EXISTS public.idx_qli_quotation;
DROP INDEX IF EXISTS public.idx_q_vendor;
DROP INDEX IF EXISTS public.idx_q_status;
DROP INDEX IF EXISTS public.idx_q_rfq;
DROP INDEX IF EXISTS public.idx_q_rank;
DROP INDEX IF EXISTS public.idx_ptl_stages;
DROP INDEX IF EXISTS public.idx_ptl_project;
DROP INDEX IF EXISTS public.idx_ptl_created;
DROP INDEX IF EXISTS public.idx_pt_status;
DROP INDEX IF EXISTS public.idx_pt_project;
DROP INDEX IF EXISTS public.idx_pt_parent;
DROP INDEX IF EXISTS public.idx_pt_overdue;
DROP INDEX IF EXISTS public.idx_pt_due_date;
DROP INDEX IF EXISTS public.idx_pt_assignee;
DROP INDEX IF EXISTS public.idx_projects_workflow;
DROP INDEX IF EXISTS public.idx_projects_status;
DROP INDEX IF EXISTS public.idx_projects_stage;
DROP INDEX IF EXISTS public.idx_pm_user;
DROP INDEX IF EXISTS public.idx_pm_project;
DROP INDEX IF EXISTS public.idx_pm_active;
DROP INDEX IF EXISTS public.idx_pd_status;
DROP INDEX IF EXISTS public.idx_pd_project;
DROP INDEX IF EXISTS public.idx_pd_parent;
DROP INDEX IF EXISTS public.idx_pd_expiry;
DROP INDEX IF EXISTS public.idx_pd_doc_type;
DROP INDEX IF EXISTS public.idx_pcs_project;
DROP INDEX IF EXISTS public.idx_pc_project;
DROP INDEX IF EXISTS public.idx_pc_created;
DROP INDEX IF EXISTS public.idx_n_unread;
DROP INDEX IF EXISTS public.idx_n_recipient;
DROP INDEX IF EXISTS public.idx_n_group;
DROP INDEX IF EXISTS public.idx_n_created;
DROP INDEX IF EXISTS public.idx_ml_token;
DROP INDEX IF EXISTS public.idx_ml_status;
DROP INDEX IF EXISTS public.idx_ml_rfq;
DROP INDEX IF EXISTS public.idx_mibid_tenant_subs_tenant;
DROP INDEX IF EXISTS public.idx_mibid_tenant_menu_perm_tenant;
DROP INDEX IF EXISTS public.idx_mibid_subs_notif_tenant;
DROP INDEX IF EXISTS public.idx_mibid_subs_invoices_tenant;
DROP INDEX IF EXISTS public.idx_mibid_app_menus_module;
DROP INDEX IF EXISTS public.idx_fa_entity;
DROP INDEX IF EXISTS public.idx_dal_document;
DROP INDEX IF EXISTS public.idx_dal_created;
DROP INDEX IF EXISTS public.idx_al_user;
DROP INDEX IF EXISTS public.idx_al_session;
DROP INDEX IF EXISTS public.idx_al_project;
DROP INDEX IF EXISTS public.idx_al_entity;
DROP INDEX IF EXISTS public.idx_al_created;
ALTER TABLE IF EXISTS ONLY public.workflows DROP CONSTRAINT IF EXISTS workflows_pkey;
ALTER TABLE IF EXISTS ONLY public.workflow_versions DROP CONSTRAINT IF EXISTS workflow_versions_pkey;
ALTER TABLE IF EXISTS ONLY public.workflow_transitions DROP CONSTRAINT IF EXISTS workflow_transitions_pkey;
ALTER TABLE IF EXISTS ONLY public.workflow_stages DROP CONSTRAINT IF EXISTS workflow_stages_pkey;
ALTER TABLE IF EXISTS ONLY public.workflow_stage_tasks DROP CONSTRAINT IF EXISTS workflow_stage_tasks_pkey;
ALTER TABLE IF EXISTS ONLY public.workflow_definitions DROP CONSTRAINT IF EXISTS workflow_definitions_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.user_sessions DROP CONSTRAINT IF EXISTS user_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.workflow_versions DROP CONSTRAINT IF EXISTS uq_wv_version;
ALTER TABLE IF EXISTS ONLY public.workflow_transitions DROP CONSTRAINT IF EXISTS uq_wt_from_to;
ALTER TABLE IF EXISTS ONLY public.workflow_stages DROP CONSTRAINT IF EXISTS uq_wfstages_seq;
ALTER TABLE IF EXISTS ONLY public.workflow_stages DROP CONSTRAINT IF EXISTS uq_wfstages_code;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS uq_users_email;
ALTER TABLE IF EXISTS ONLY public.user_sessions DROP CONSTRAINT IF EXISTS uq_us_session;
ALTER TABLE IF EXISTS ONLY public.tenants DROP CONSTRAINT IF EXISTS uq_tenant_domain;
ALTER TABLE IF EXISTS ONLY public.subscription_plans DROP CONSTRAINT IF EXISTS uq_sub_plans_code;
ALTER TABLE IF EXISTS ONLY public.system_settings DROP CONSTRAINT IF EXISTS uq_ss_key;
ALTER TABLE IF EXISTS ONLY public.stage_doc_rules DROP CONSTRAINT IF EXISTS uq_sdr_stage_doc;
ALTER TABLE IF EXISTS ONLY public.shipments DROP CONSTRAINT IF EXISTS uq_s_bl;
ALTER TABLE IF EXISTS ONLY public.rfq_vendors DROP CONSTRAINT IF EXISTS uq_rv_rfq_email;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS uq_roles_name;
ALTER TABLE IF EXISTS ONLY public.rfqs DROP CONSTRAINT IF EXISTS uq_rfqs_code;
ALTER TABLE IF EXISTS ONLY public.quotation_line_items DROP CONSTRAINT IF EXISTS uq_qli_quot_item;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS uq_projects_code;
ALTER TABLE IF EXISTS ONLY public.project_members DROP CONSTRAINT IF EXISTS uq_pm_project_user;
ALTER TABLE IF EXISTS ONLY public.project_checklist_status DROP CONSTRAINT IF EXISTS uq_pcs_proj_item;
ALTER TABLE IF EXISTS ONLY public.magic_links DROP CONSTRAINT IF EXISTS uq_ml_token;
ALTER TABLE IF EXISTS ONLY public.doc_types DROP CONSTRAINT IF EXISTS uq_doc_types_name;
ALTER TABLE IF EXISTS ONLY public.app_menus DROP CONSTRAINT IF EXISTS uq_app_menus_code;
ALTER TABLE IF EXISTS ONLY public.tenants DROP CONSTRAINT IF EXISTS tenants_pkey;
ALTER TABLE IF EXISTS ONLY public.tenant_subscriptions DROP CONSTRAINT IF EXISTS tenant_subscriptions_pkey;
ALTER TABLE IF EXISTS ONLY public.tenant_menu_permissions DROP CONSTRAINT IF EXISTS tenant_menu_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_pkey;
ALTER TABLE IF EXISTS ONLY public.system_settings DROP CONSTRAINT IF EXISTS system_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.system_config DROP CONSTRAINT IF EXISTS system_config_pkey;
ALTER TABLE IF EXISTS ONLY public.supplier_partners DROP CONSTRAINT IF EXISTS supplier_partners_pkey;
ALTER TABLE IF EXISTS ONLY public.subscription_plans DROP CONSTRAINT IF EXISTS subscription_plans_pkey;
ALTER TABLE IF EXISTS ONLY public.subscription_notifications DROP CONSTRAINT IF EXISTS subscription_notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.subscription_invoices DROP CONSTRAINT IF EXISTS subscription_invoices_pkey;
ALTER TABLE IF EXISTS ONLY public.subscription_invoices DROP CONSTRAINT IF EXISTS subscription_invoices_invoice_number_key;
ALTER TABLE IF EXISTS ONLY public.stage_notifications DROP CONSTRAINT IF EXISTS stage_notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.stage_doc_rules DROP CONSTRAINT IF EXISTS stage_doc_rules_pkey;
ALTER TABLE IF EXISTS ONLY public.stage_checklist_items DROP CONSTRAINT IF EXISTS stage_checklist_items_pkey;
ALTER TABLE IF EXISTS ONLY public.shipments DROP CONSTRAINT IF EXISTS shipments_pkey;
ALTER TABLE IF EXISTS ONLY public.shipment_milestones DROP CONSTRAINT IF EXISTS shipment_milestones_pkey;
ALTER TABLE IF EXISTS ONLY public.shipment_costs DROP CONSTRAINT IF EXISTS shipment_costs_pkey;
ALTER TABLE IF EXISTS ONLY public.saas_modules DROP CONSTRAINT IF EXISTS saas_modules_pkey;
ALTER TABLE IF EXISTS ONLY public.saas_features DROP CONSTRAINT IF EXISTS saas_features_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.rfqs DROP CONSTRAINT IF EXISTS rfqs_pkey;
ALTER TABLE IF EXISTS ONLY public.rfq_vendors DROP CONSTRAINT IF EXISTS rfq_vendors_pkey;
ALTER TABLE IF EXISTS ONLY public.rfq_line_items DROP CONSTRAINT IF EXISTS rfq_line_items_pkey;
ALTER TABLE IF EXISTS ONLY public.rfq_evaluation_criteria DROP CONSTRAINT IF EXISTS rfq_evaluation_criteria_pkey;
ALTER TABLE IF EXISTS ONLY public.quotations DROP CONSTRAINT IF EXISTS quotations_pkey;
ALTER TABLE IF EXISTS ONLY public.quotation_line_items DROP CONSTRAINT IF EXISTS quotation_line_items_pkey;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_pkey;
ALTER TABLE IF EXISTS ONLY public.project_transition_logs DROP CONSTRAINT IF EXISTS project_transition_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.project_tasks DROP CONSTRAINT IF EXISTS project_tasks_pkey;
ALTER TABLE IF EXISTS ONLY public.project_members DROP CONSTRAINT IF EXISTS project_members_pkey;
ALTER TABLE IF EXISTS ONLY public.project_documents DROP CONSTRAINT IF EXISTS project_documents_pkey;
ALTER TABLE IF EXISTS ONLY public.project_comments DROP CONSTRAINT IF EXISTS project_comments_pkey;
ALTER TABLE IF EXISTS ONLY public.project_checklist_status DROP CONSTRAINT IF EXISTS project_checklist_status_pkey;
ALTER TABLE IF EXISTS ONLY public.plan_features DROP CONSTRAINT IF EXISTS plan_features_pkey;
ALTER TABLE IF EXISTS ONLY public.partner_support_tickets DROP CONSTRAINT IF EXISTS partner_support_tickets_pkey;
ALTER TABLE IF EXISTS ONLY public.partner_onboarding_requests DROP CONSTRAINT IF EXISTS partner_onboarding_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.outbox_events DROP CONSTRAINT IF EXISTS outbox_events_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.magic_links DROP CONSTRAINT IF EXISTS magic_links_pkey;
ALTER TABLE IF EXISTS ONLY public.integration_endpoints DROP CONSTRAINT IF EXISTS integration_endpoints_pkey;
ALTER TABLE IF EXISTS ONLY public.idempotent_event_logs DROP CONSTRAINT IF EXISTS idempotent_event_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.file_sync_logs DROP CONSTRAINT IF EXISTS file_sync_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.file_attachments DROP CONSTRAINT IF EXISTS file_attachments_pkey;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_pkey;
ALTER TABLE IF EXISTS ONLY public.document_audit_logs DROP CONSTRAINT IF EXISTS document_audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.doc_types DROP CONSTRAINT IF EXISTS doc_types_pkey;
ALTER TABLE IF EXISTS ONLY public.app_menus DROP CONSTRAINT IF EXISTS app_menus_pkey;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_pkey;
DROP TABLE IF EXISTS public.workflows;
DROP TABLE IF EXISTS public.workflow_versions;
DROP TABLE IF EXISTS public.workflow_transitions;
DROP TABLE IF EXISTS public.workflow_stage_tasks;
DROP TABLE IF EXISTS public.workflow_definitions;
DROP VIEW IF EXISTS public.v_project_sla_status;
DROP TABLE IF EXISTS public.workflow_stages;
DROP VIEW IF EXISTS public.v_overdue_milestones;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_sessions;
DROP TABLE IF EXISTS public.tenants;
DROP TABLE IF EXISTS public.tenant_subscriptions;
DROP TABLE IF EXISTS public.tenant_menu_permissions;
DROP TABLE IF EXISTS public.tasks;
DROP TABLE IF EXISTS public.system_settings;
DROP TABLE IF EXISTS public.system_config;
DROP TABLE IF EXISTS public.supplier_partners;
DROP TABLE IF EXISTS public.subscription_plans;
DROP TABLE IF EXISTS public.subscription_notifications;
DROP TABLE IF EXISTS public.subscription_invoices;
DROP TABLE IF EXISTS public.stage_notifications;
DROP TABLE IF EXISTS public.stage_doc_rules;
DROP TABLE IF EXISTS public.stage_checklist_items;
DROP TABLE IF EXISTS public.shipments;
DROP TABLE IF EXISTS public.shipment_milestones;
DROP TABLE IF EXISTS public.shipment_costs;
DROP TABLE IF EXISTS public.saas_modules;
DROP TABLE IF EXISTS public.saas_features;
DROP TABLE IF EXISTS public.roles;
DROP TABLE IF EXISTS public.role_permissions;
DROP TABLE IF EXISTS public.rfqs;
DROP TABLE IF EXISTS public.rfq_vendors;
DROP TABLE IF EXISTS public.rfq_line_items;
DROP TABLE IF EXISTS public.rfq_evaluation_criteria;
DROP TABLE IF EXISTS public.quotations;
DROP TABLE IF EXISTS public.quotation_line_items;
DROP TABLE IF EXISTS public.projects;
DROP TABLE IF EXISTS public.project_transition_logs;
DROP TABLE IF EXISTS public.project_tasks;
DROP TABLE IF EXISTS public.project_members;
DROP TABLE IF EXISTS public.project_documents;
DROP TABLE IF EXISTS public.project_comments;
DROP TABLE IF EXISTS public.project_checklist_status;
DROP TABLE IF EXISTS public.plan_features;
DROP TABLE IF EXISTS public.partner_support_tickets;
DROP TABLE IF EXISTS public.partner_onboarding_requests;
DROP TABLE IF EXISTS public.outbox_events;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.magic_links;
DROP TABLE IF EXISTS public.integration_endpoints;
DROP TABLE IF EXISTS public.idempotent_event_logs;
DROP TABLE IF EXISTS public.file_sync_logs;
DROP TABLE IF EXISTS public.file_attachments;
DROP TABLE IF EXISTS public.documents;
DROP TABLE IF EXISTS public.document_audit_logs;
DROP TABLE IF EXISTS public.doc_types;
DROP TABLE IF EXISTS public.app_menus;
DROP TABLE IF EXISTS public.activity_logs;
DROP FUNCTION IF EXISTS public.fn_update_timestamp();
DROP FUNCTION IF EXISTS public.fn_calc_transition_duration();
DROP FUNCTION IF EXISTS public.fn_calc_delay_days();
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS pgcrypto;
--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: fn_calc_delay_days(); Type: FUNCTION; Schema: public; Owner: mibid_admin
--

CREATE FUNCTION public.fn_calc_delay_days() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.actual_date IS NOT NULL AND NEW.planned_date IS NOT NULL THEN
        NEW.delay_days = NEW.actual_date - NEW.planned_date;
    END IF;
    IF NEW.actual_date IS NOT NULL THEN
        NEW.is_completed = TRUE;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_calc_delay_days() OWNER TO mibid_admin;

--
-- Name: fn_calc_transition_duration(); Type: FUNCTION; Schema: public; Owner: mibid_admin
--

CREATE FUNCTION public.fn_calc_transition_duration() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_entered_at TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT stage_entered_at INTO v_entered_at
    FROM projects WHERE id = NEW.project_id;
    IF v_entered_at IS NOT NULL THEN
        NEW.duration_hours = EXTRACT(EPOCH FROM (NOW() - v_entered_at)) / 3600.0;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_calc_transition_duration() OWNER TO mibid_admin;

--
-- Name: fn_update_timestamp(); Type: FUNCTION; Schema: public; Owner: mibid_admin
--

CREATE FUNCTION public.fn_update_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_update_timestamp() OWNER TO mibid_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.activity_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid,
    session_id character varying(100),
    action character varying(50) NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id uuid,
    project_id uuid,
    description text,
    old_values jsonb,
    new_values jsonb,
    metadata jsonb,
    ip_address inet,
    user_agent character varying(500),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.activity_logs OWNER TO mibid_admin;

--
-- Name: TABLE activity_logs; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.activity_logs IS 'Full audit trail: old/new values diff, session tracing, project-scoped queries';


--
-- Name: app_menus; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.app_menus (
    id character varying(50) NOT NULL,
    code character varying(50) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    icon character varying(50),
    is_active boolean NOT NULL,
    is_system boolean NOT NULL,
    module_code character varying(50) NOT NULL,
    parent_id character varying(50),
    path character varying(100) NOT NULL,
    required_permission character varying(100),
    sort_order integer,
    title character varying(100) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.app_menus OWNER TO mibid_admin;

--
-- Name: doc_types; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.doc_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(50),
    description text,
    category character varying(50),
    allowed_extensions text[] DEFAULT '{pdf,docx,xlsx,jpg,png}'::text[],
    max_file_size_mb integer DEFAULT 20,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.doc_types OWNER TO mibid_admin;

--
-- Name: TABLE doc_types; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.doc_types IS 'Danh mục loại tài liệu XNK: Có cấu hình file extension cho phép và dung lượng tối đa';


--
-- Name: document_audit_logs; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.document_audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    document_id uuid NOT NULL,
    action character varying(20) NOT NULL,
    old_status character varying(20),
    new_status character varying(20),
    performed_by uuid NOT NULL,
    comment text,
    ip_address inet,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_dal_action CHECK (((action)::text = ANY ((ARRAY['UPLOADED'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying, 'RE_UPLOADED'::character varying, 'SUPERSEDED'::character varying, 'DOWNLOADED'::character varying, 'EXPIRED'::character varying])::text[])))
);


ALTER TABLE public.document_audit_logs OWNER TO mibid_admin;

--
-- Name: TABLE document_audit_logs; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.document_audit_logs IS 'Full audit trail: Ghi lại old/new status, IP, comment cho mọi hành động trên tài liệu';


--
-- Name: documents; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.documents (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by uuid,
    is_deleted boolean NOT NULL,
    tenant_id uuid NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    updated_by uuid,
    version bigint,
    approval_status character varying(32) NOT NULL,
    approved_by uuid,
    document_type_code character varying(64) NOT NULL,
    effective_from date,
    expires_at date,
    file_size_bytes bigint NOT NULL,
    mime_type character varying(128),
    s3_object_key character varying(512) NOT NULL,
    title character varying(255) NOT NULL
);


ALTER TABLE public.documents OWNER TO mibid_admin;

--
-- Name: file_attachments; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.file_attachments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id uuid NOT NULL,
    file_name character varying(255) NOT NULL,
    original_name character varying(255),
    file_url character varying(500) NOT NULL,
    file_size_bytes bigint DEFAULT 0 NOT NULL,
    mime_type character varying(100),
    uploaded_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.file_attachments OWNER TO mibid_admin;

--
-- Name: TABLE file_attachments; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.file_attachments IS 'Bảng file đính kèm dùng chung (Polymorphic). Không dùng FK cứng vì đa entity_type';


--
-- Name: file_sync_logs; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.file_sync_logs (
    id character varying(64) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    error_count integer NOT NULL,
    error_log_json text,
    file_type character varying(64) NOT NULL,
    name character varying(255) NOT NULL,
    status character varying(32) NOT NULL,
    success_count integer NOT NULL,
    tenant_id uuid NOT NULL,
    total_records integer NOT NULL
);


ALTER TABLE public.file_sync_logs OWNER TO mibid_admin;

--
-- Name: idempotent_event_logs; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.idempotent_event_logs (
    id character varying(128) NOT NULL,
    event_type character varying(128) NOT NULL,
    expire_at timestamp(6) without time zone NOT NULL,
    processed_at timestamp(6) without time zone NOT NULL,
    source_system character varying(64) NOT NULL,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.idempotent_event_logs OWNER TO mibid_admin;

--
-- Name: integration_endpoints; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.integration_endpoints (
    id character varying(64) NOT NULL,
    auth_config text,
    created_at timestamp(6) without time zone NOT NULL,
    endpoint_url character varying(1024),
    integration_mode character varying(64) NOT NULL,
    is_active boolean NOT NULL,
    last_sync_at timestamp(6) without time zone NOT NULL,
    mapping_schema text,
    name character varying(255) NOT NULL,
    sync_status character varying(32) NOT NULL,
    system_type character varying(64) NOT NULL,
    tenant_id uuid NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.integration_endpoints OWNER TO mibid_admin;

--
-- Name: magic_links; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.magic_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    rfq_id uuid NOT NULL,
    rfq_vendor_id uuid,
    vendor_email character varying(150) NOT NULL,
    vendor_name character varying(200),
    token character varying(1000) NOT NULL,
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    sent_at timestamp with time zone,
    first_opened_at timestamp with time zone,
    used_at timestamp with time zone,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_ml_status CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'USED'::character varying, 'EXPIRED'::character varying, 'REVOKED'::character varying])::text[])))
);


ALTER TABLE public.magic_links OWNER TO mibid_admin;

--
-- Name: TABLE magic_links; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.magic_links IS 'JWT Magic Link. Ghi nhận cả IP và thời điểm mở link để audit bảo mật';


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    recipient_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    body text,
    type character varying(30) NOT NULL,
    priority character varying(10) DEFAULT 'NORMAL'::character varying NOT NULL,
    reference_type character varying(50),
    reference_id uuid,
    action_url character varying(500),
    is_read boolean DEFAULT false NOT NULL,
    read_at timestamp with time zone,
    is_archived boolean DEFAULT false NOT NULL,
    channel character varying(20) DEFAULT 'IN_APP'::character varying NOT NULL,
    email_sent_at timestamp with time zone,
    email_status character varying(20),
    group_key character varying(100),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_n_channel CHECK (((channel)::text = ANY ((ARRAY['IN_APP'::character varying, 'EMAIL'::character varying, 'BOTH'::character varying])::text[]))),
    CONSTRAINT chk_n_email_st CHECK (((email_status IS NULL) OR ((email_status)::text = ANY ((ARRAY['PENDING'::character varying, 'SENT'::character varying, 'FAILED'::character varying, 'BOUNCED'::character varying])::text[])))),
    CONSTRAINT chk_n_priority CHECK (((priority)::text = ANY ((ARRAY['LOW'::character varying, 'NORMAL'::character varying, 'HIGH'::character varying, 'URGENT'::character varying])::text[]))),
    CONSTRAINT chk_n_type CHECK (((type)::text = ANY ((ARRAY['TASK_ASSIGNED'::character varying, 'TASK_OVERDUE'::character varying, 'QUOTE_RECEIVED'::character varying, 'QUOTE_APPROVED'::character varying, 'DOC_UPLOADED'::character varying, 'DOC_APPROVED'::character varying, 'DOC_REJECTED'::character varying, 'DOC_EXPIRED'::character varying, 'OVERDUE_ALERT'::character varying, 'SLA_WARNING'::character varying, 'SLA_BREACH'::character varying, 'STAGE_CHANGED'::character varying, 'RFQ_PUBLISHED'::character varying, 'RFQ_CLOSED'::character varying, 'SHIPMENT_UPDATE'::character varying, 'MILESTONE_OVERDUE'::character varying, 'COMMENT_MENTION'::character varying, 'SYSTEM'::character varying])::text[])))
);


ALTER TABLE public.notifications OWNER TO mibid_admin;

--
-- Name: TABLE notifications; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.notifications IS 'Notification center: WebSocket push (IN_APP), Email queue (EMAIL), priority-based, group badge counting';


--
-- Name: outbox_events; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.outbox_events (
    id uuid NOT NULL,
    aggregate_id uuid NOT NULL,
    aggregate_type character varying(64) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    event_type character varying(128) NOT NULL,
    payload text NOT NULL,
    processed_at timestamp(6) without time zone,
    retry_count integer NOT NULL,
    status character varying(32) NOT NULL,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.outbox_events OWNER TO mibid_admin;

--
-- Name: partner_onboarding_requests; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.partner_onboarding_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    company_name character varying(255) NOT NULL,
    tax_code character varying(50),
    country character varying(100),
    category character varying(100),
    contact_person character varying(150),
    email character varying(150),
    phone character varying(50),
    cert_file_name character varying(255),
    status character varying(32) DEFAULT 'PENDING_APPROVAL'::character varying,
    submitted_at timestamp with time zone DEFAULT now(),
    review_notes text,
    is_deleted boolean DEFAULT false,
    version bigint DEFAULT 0,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.partner_onboarding_requests OWNER TO mibid_admin;

--
-- Name: partner_support_tickets; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.partner_support_tickets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    ticket_code character varying(64) NOT NULL,
    partner_name character varying(255) NOT NULL,
    partner_email character varying(150) NOT NULL,
    rfq_code character varying(64),
    issue_type character varying(64) NOT NULL,
    status character varying(32) DEFAULT 'OPEN'::character varying,
    requested_at timestamp with time zone DEFAULT now(),
    current_pin character varying(20),
    is_deleted boolean DEFAULT false,
    version bigint DEFAULT 0,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.partner_support_tickets OWNER TO mibid_admin;

--
-- Name: plan_features; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.plan_features (
    plan_id uuid NOT NULL,
    feature_code character varying(50) NOT NULL
);


ALTER TABLE public.plan_features OWNER TO mibid_admin;

--
-- Name: project_checklist_status; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.project_checklist_status (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    project_id uuid NOT NULL,
    checklist_item_id uuid NOT NULL,
    is_checked boolean DEFAULT false NOT NULL,
    checked_by uuid,
    checked_at timestamp with time zone,
    notes text
);


ALTER TABLE public.project_checklist_status OWNER TO mibid_admin;

--
-- Name: TABLE project_checklist_status; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.project_checklist_status IS 'Ghi nhận trạng thái tick/untick checklist cho từng Dự án cụ thể';


--
-- Name: project_comments; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.project_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    project_id uuid NOT NULL,
    parent_id uuid,
    author_id uuid NOT NULL,
    content text NOT NULL,
    attachment_urls text[],
    is_internal boolean DEFAULT true NOT NULL,
    is_edited boolean DEFAULT false NOT NULL,
    edited_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.project_comments OWNER TO mibid_admin;

--
-- Name: TABLE project_comments; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.project_comments IS 'Hệ thống bình luận / trao đổi nội bộ trong Dự án. Hỗ trợ Reply thread';


--
-- Name: project_documents; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.project_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    project_id uuid NOT NULL,
    doc_type_id uuid NOT NULL,
    parent_id uuid,
    file_name character varying(255) NOT NULL,
    original_name character varying(255),
    file_url character varying(500) NOT NULL,
    file_size_bytes bigint DEFAULT 0 NOT NULL,
    mime_type character varying(100) DEFAULT 'application/pdf'::character varying NOT NULL,
    checksum_sha256 character varying(64),
    version integer DEFAULT 1 NOT NULL,
    document_date date,
    expiry_date date,
    reference_number character varying(100),
    tags text[],
    description text,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    uploaded_by uuid NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    review_comment text,
    rejection_count integer DEFAULT 0 NOT NULL,
    is_confidential boolean DEFAULT false NOT NULL,
    download_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_pd_status CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying, 'SUPERSEDED'::character varying, 'EXPIRED'::character varying])::text[])))
);


ALTER TABLE public.project_documents OWNER TO mibid_admin;

--
-- Name: TABLE project_documents; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.project_documents IS 'DMS: Quản lý tài liệu với version chain, hạn hiệu lực, mật, và hash toàn vẹn';


--
-- Name: COLUMN project_documents.parent_id; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON COLUMN public.project_documents.parent_id IS 'Khi upload lại bản mới, bản cũ chuyển SUPERSEDED, bản mới trỏ parent_id về bản cũ';


--
-- Name: project_members; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.project_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    project_id uuid NOT NULL,
    user_id uuid NOT NULL,
    project_role character varying(30) NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    can_edit boolean DEFAULT true NOT NULL,
    can_approve boolean DEFAULT false NOT NULL,
    can_transition boolean DEFAULT false NOT NULL,
    notifications_enabled boolean DEFAULT true NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    removed_at timestamp with time zone,
    added_by uuid,
    CONSTRAINT chk_pm_role CHECK (((project_role)::text = ANY ((ARRAY['OWNER'::character varying, 'SOURCING_LEAD'::character varying, 'SALES_EXEC'::character varying, 'LOGISTICS_EXEC'::character varying, 'FINANCE'::character varying, 'QC'::character varying, 'MEMBER'::character varying])::text[])))
);


ALTER TABLE public.project_members OWNER TO mibid_admin;

--
-- Name: TABLE project_members; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.project_members IS 'ABAC: Gán User vào Dự án kèm quyền hành động cụ thể (edit/approve/transition)';


--
-- Name: project_tasks; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.project_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    project_id uuid NOT NULL,
    stage_id uuid,
    parent_id uuid,
    task_code character varying(50),
    title character varying(255) NOT NULL,
    description text,
    category character varying(50),
    assignee_id uuid,
    reviewer_id uuid,
    watchers uuid[],
    priority character varying(20) DEFAULT 'MEDIUM'::character varying NOT NULL,
    status character varying(20) DEFAULT 'TODO'::character varying NOT NULL,
    is_auto_generated boolean DEFAULT false NOT NULL,
    source_template_id uuid,
    start_date timestamp with time zone,
    due_date timestamp with time zone NOT NULL,
    completed_at timestamp with time zone,
    estimated_hours numeric(6,1),
    actual_hours numeric(6,1),
    attachment_urls text[],
    result_notes text,
    comments_count integer DEFAULT 0 NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_pt_priority CHECK (((priority)::text = ANY ((ARRAY['LOW'::character varying, 'MEDIUM'::character varying, 'HIGH'::character varying, 'URGENT'::character varying])::text[]))),
    CONSTRAINT chk_pt_status CHECK (((status)::text = ANY ((ARRAY['TODO'::character varying, 'DOING'::character varying, 'IN_REVIEW'::character varying, 'DONE'::character varying, 'CANCELLED'::character varying, 'OVERDUE'::character varying, 'BLOCKED'::character varying])::text[])))
);


ALTER TABLE public.project_tasks OWNER TO mibid_admin;

--
-- Name: TABLE project_tasks; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.project_tasks IS 'Task management production-grade: Sub-tasks, Watchers, Time tracking, Review flow, Blocking chain';


--
-- Name: project_transition_logs; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.project_transition_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    project_id uuid NOT NULL,
    transition_id uuid,
    from_stage_id uuid,
    to_stage_id uuid NOT NULL,
    transitioned_by uuid NOT NULL,
    is_forced boolean DEFAULT false NOT NULL,
    comment text,
    duration_hours numeric(10,2),
    blocked_reasons jsonb,
    checklist_snapshot jsonb,
    doc_compliance jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.project_transition_logs OWNER TO mibid_admin;

--
-- Name: TABLE project_transition_logs; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.project_transition_logs IS 'Full audit mỗi lần kéo thẻ: duration, snapshot checklist, doc compliance. Dùng cho Dashboard Cycle Time';


--
-- Name: projects; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    project_code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    workflow_id uuid,
    workflow_version_id uuid,
    current_stage_id uuid,
    stage_entered_at timestamp with time zone,
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_deleted boolean DEFAULT false,
    updated_by uuid,
    version bigint DEFAULT 0,
    bid_submission_deadline timestamp(6) without time zone,
    code character varying(64) NOT NULL,
    currency character varying(8) NOT NULL,
    estimated_budget numeric(18,2),
    investor_type character varying(32),
    manager_id uuid,
    procurement_method character varying(32),
    investor_name character varying(255),
    tender_type character varying(50),
    stage_enum character varying(50),
    manager_name character varying(150),
    completed_tasks integer DEFAULT 0,
    total_tasks integer DEFAULT 0,
    industry_sector character varying(50),
    CONSTRAINT chk_projects_status CHECK (((status)::text = ANY (ARRAY['ACTIVE'::text, 'IN_PROGRESS'::text, 'SUBMITTED'::text, 'WON'::text, 'LOST'::text, 'CANCELLED'::text, 'ARCHIVED'::text])))
);


ALTER TABLE public.projects OWNER TO mibid_admin;

--
-- Name: TABLE projects; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.projects IS 'Dự án đấu thầu XNK. Ghim vào workflow_version_id cụ thể, không bị ảnh hưởng khi Admin sửa Workflow';


--
-- Name: COLUMN projects.stage_entered_at; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON COLUMN public.projects.stage_entered_at IS 'Thời điểm chuyển vào bước hiện tại. Dùng để tính SLA = NOW() - stage_entered_at';


--
-- Name: quotation_line_items; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.quotation_line_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    quotation_id uuid NOT NULL,
    rfq_item_id uuid NOT NULL,
    quantity_offered numeric(12,2),
    unit_price numeric(15,4) NOT NULL,
    discount_pct numeric(5,2) DEFAULT 0 NOT NULL,
    tax_pct numeric(5,2) DEFAULT 0 NOT NULL,
    total_price numeric(15,2) NOT NULL,
    brand_offered character varying(200),
    model_offered character varying(100),
    origin_country character varying(100),
    hs_code character varying(20),
    packaging_details text,
    weight_kg numeric(12,3),
    dimensions_cm character varying(100),
    cbm numeric(10,4),
    lead_time_days integer,
    moq numeric(12,2),
    warranty_months integer,
    notes text,
    attachment_urls text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_qli_disc CHECK (((discount_pct >= (0)::numeric) AND (discount_pct <= (100)::numeric))),
    CONSTRAINT chk_qli_price CHECK ((unit_price >= (0)::numeric)),
    CONSTRAINT chk_qli_tax CHECK (((tax_pct >= (0)::numeric) AND (tax_pct <= (100)::numeric))),
    CONSTRAINT chk_qli_total CHECK ((total_price >= (0)::numeric))
);


ALTER TABLE public.quotation_line_items OWNER TO mibid_admin;

--
-- Name: TABLE quotation_line_items; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.quotation_line_items IS 'Chi tiết báo giá từng mặt hàng. Bao gồm specs thực tế Vendor đề xuất, trọng lượng, CBM cho logistics';


--
-- Name: COLUMN quotation_line_items.unit_price; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON COLUMN public.quotation_line_items.unit_price IS 'Dùng DECIMAL(15,4) vì hàng XNK giá nhỏ (VD: ốc vít $0.0035/pc)';


--
-- Name: COLUMN quotation_line_items.cbm; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON COLUMN public.quotation_line_items.cbm IS 'Cubic Meter - Thể tích. Rất quan trọng khi tính cước container (FCL/LCL)';


--
-- Name: quotations; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.quotations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    rfq_id uuid NOT NULL,
    magic_link_id uuid,
    rfq_vendor_id uuid,
    quotation_code character varying(50),
    vendor_email character varying(150) NOT NULL,
    vendor_name character varying(200),
    vendor_company character varying(255),
    vendor_phone character varying(30),
    vendor_address text,
    currency character varying(10) DEFAULT 'USD'::character varying NOT NULL,
    exchange_rate numeric(12,6) DEFAULT 1.000000,
    subtotal numeric(15,2) DEFAULT 0 NOT NULL,
    discount_pct numeric(5,2) DEFAULT 0 NOT NULL,
    discount_amount numeric(15,2) DEFAULT 0 NOT NULL,
    tax_pct numeric(5,2) DEFAULT 0 NOT NULL,
    tax_amount numeric(15,2) DEFAULT 0 NOT NULL,
    shipping_cost numeric(15,2) DEFAULT 0 NOT NULL,
    insurance_cost numeric(15,2) DEFAULT 0 NOT NULL,
    other_charges numeric(15,2) DEFAULT 0 NOT NULL,
    grand_total numeric(15,2) NOT NULL,
    payment_terms character varying(200),
    incoterms_offered character varying(10),
    delivery_terms text,
    warranty_terms text,
    warranty_months integer,
    lead_time_days integer,
    eta_date date NOT NULL,
    quote_valid_until date,
    moq numeric(12,2),
    production_capacity text,
    certifications text,
    origin_country character varying(100),
    document_ids uuid[],
    attachment_urls text[],
    internal_score numeric(5,2),
    score_breakdown jsonb,
    internal_notes text,
    comparison_rank integer,
    status character varying(20) DEFAULT 'SUBMITTED'::character varying NOT NULL,
    rejection_reason text,
    approved_by uuid,
    approved_at timestamp with time zone,
    submitted_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_q_disc_pct CHECK (((discount_pct >= (0)::numeric) AND (discount_pct <= (100)::numeric))),
    CONSTRAINT chk_q_grand_total CHECK ((grand_total >= (0)::numeric)),
    CONSTRAINT chk_q_insurance CHECK ((insurance_cost >= (0)::numeric)),
    CONSTRAINT chk_q_score CHECK (((internal_score IS NULL) OR ((internal_score >= (0)::numeric) AND (internal_score <= (100)::numeric)))),
    CONSTRAINT chk_q_shipping CHECK ((shipping_cost >= (0)::numeric)),
    CONSTRAINT chk_q_status CHECK (((status)::text = ANY ((ARRAY['SUBMITTED'::character varying, 'UNDER_REVIEW'::character varying, 'SHORTLISTED'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying, 'WITHDRAWN'::character varying])::text[]))),
    CONSTRAINT chk_q_subtotal CHECK ((subtotal >= (0)::numeric)),
    CONSTRAINT chk_q_tax_pct CHECK (((tax_pct >= (0)::numeric) AND (tax_pct <= (100)::numeric)))
);


ALTER TABLE public.quotations OWNER TO mibid_admin;

--
-- Name: TABLE quotations; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.quotations IS 'Báo giá chuẩn XNK. Phân tách rõ subtotal/tax/shipping/insurance/grand_total. Có scoring nội bộ';


--
-- Name: COLUMN quotations.exchange_rate; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON COLUMN public.quotations.exchange_rate IS 'Tỉ giá quy đổi về base currency của RFQ. VD: RFQ dùng USD, Vendor báo VND thì lưu rate ở đây';


--
-- Name: COLUMN quotations.score_breakdown; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON COLUMN public.quotations.score_breakdown IS 'JSONB chứa điểm chi tiết theo từng tiêu chí đánh giá. VD: {"price": 35, "quality": 28}';


--
-- Name: rfq_evaluation_criteria; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.rfq_evaluation_criteria (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    rfq_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    weight_pct numeric(5,2) NOT NULL,
    description text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_rec_weight CHECK (((weight_pct >= (0)::numeric) AND (weight_pct <= (100)::numeric)))
);


ALTER TABLE public.rfq_evaluation_criteria OWNER TO mibid_admin;

--
-- Name: TABLE rfq_evaluation_criteria; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.rfq_evaluation_criteria IS 'Bảng tiêu chí khi evaluation_method = WEIGHTED_SCORE. Tổng weight_pct = 100%';


--
-- Name: rfq_line_items; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.rfq_line_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    rfq_id uuid NOT NULL,
    item_code character varying(50),
    hs_code character varying(20),
    description text NOT NULL,
    brand_manufacturer character varying(200),
    model_number character varying(100),
    origin_country character varying(100),
    quantity numeric(12,2) NOT NULL,
    uom character varying(20) NOT NULL,
    min_order_qty numeric(12,2),
    max_order_qty numeric(12,2),
    specifications text,
    quality_standard character varying(100),
    packaging_req text,
    certification_req text,
    sample_required boolean DEFAULT false NOT NULL,
    sample_qty integer,
    target_unit_price numeric(15,2),
    attachment_urls text[],
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    is_deleted boolean DEFAULT false,
    version bigint DEFAULT 0,
    CONSTRAINT chk_rli_maxmin CHECK (((max_order_qty IS NULL) OR (max_order_qty >= min_order_qty))),
    CONSTRAINT chk_rli_minmax CHECK (((min_order_qty IS NULL) OR (min_order_qty > (0)::numeric))),
    CONSTRAINT chk_rli_qty CHECK ((quantity > (0)::numeric))
);


ALTER TABLE public.rfq_line_items OWNER TO mibid_admin;

--
-- Name: TABLE rfq_line_items; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.rfq_line_items IS 'Danh sách hàng hóa cần mua. Mỗi dòng = 1 mặt hàng với đầy đủ specs kỹ thuật XNK';


--
-- Name: COLUMN rfq_line_items.hs_code; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON COLUMN public.rfq_line_items.hs_code IS 'Harmonized System Code - Mã phân loại hàng hóa Hải quan quốc tế';


--
-- Name: COLUMN rfq_line_items.target_unit_price; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON COLUMN public.rfq_line_items.target_unit_price IS 'Chỉ nội bộ, Vendor KHÔNG thấy. Dùng để so sánh giá Vendor báo với ngân sách';


--
-- Name: rfq_vendors; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.rfq_vendors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    rfq_id uuid NOT NULL,
    vendor_email character varying(150) NOT NULL,
    vendor_name character varying(200),
    company_name character varying(255),
    phone character varying(30),
    country character varying(100),
    category character varying(50),
    status character varying(20) DEFAULT 'INVITED'::character varying NOT NULL,
    invited_at timestamp with time zone,
    responded_at timestamp with time zone,
    decline_reason text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    invitation_code character varying(64),
    pin_hash character varying(255),
    pin_salt character varying(64),
    pin_attempts integer DEFAULT 0,
    pin_locked_until timestamp with time zone,
    created_by uuid,
    updated_by uuid,
    updated_at timestamp with time zone DEFAULT now(),
    is_deleted boolean DEFAULT false,
    version bigint DEFAULT 0,
    CONSTRAINT chk_rv_status CHECK (((status)::text = ANY ((ARRAY['INVITED'::character varying, 'LINK_SENT'::character varying, 'VIEWED'::character varying, 'AUTHENTICATED'::character varying, 'SUBMITTED'::character varying, 'DECLINED'::character varying, 'DISQUALIFIED'::character varying])::text[])))
);


ALTER TABLE public.rfq_vendors OWNER TO mibid_admin;

--
-- Name: TABLE rfq_vendors; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.rfq_vendors IS 'Theo dõi chi tiết từng Vendor được mời vào RFQ. Biết ai đã xem, ai đã nộp, ai từ chối';


--
-- Name: rfqs; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.rfqs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    project_id uuid NOT NULL,
    rfq_code character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    incoterms character varying(10) NOT NULL,
    currency character varying(10) DEFAULT 'USD'::character varying NOT NULL,
    payment_terms character varying(100),
    shipping_method character varying(30) DEFAULT 'SEA'::character varying NOT NULL,
    deadline timestamp with time zone NOT NULL,
    required_delivery_date date,
    quote_validity_days integer DEFAULT 30 NOT NULL,
    delivery_port character varying(200),
    delivery_address text,
    origin_country character varying(100),
    requires_sample boolean DEFAULT false NOT NULL,
    requires_factory_audit boolean DEFAULT false NOT NULL,
    special_requirements text,
    budget_amount numeric(15,2),
    evaluation_method character varying(30) DEFAULT 'LOWEST_PRICE'::character varying NOT NULL,
    rfq_round integer DEFAULT 1 NOT NULL,
    parent_rfq_id uuid,
    status character varying(20) DEFAULT 'DRAFT'::character varying NOT NULL,
    published_at timestamp with time zone,
    closed_at timestamp with time zone,
    closed_reason text,
    created_by uuid,
    approved_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    project_name character varying(255),
    supplier_name character varying(255),
    supplier_email character varying(150),
    item_count integer DEFAULT 0,
    incoterm character varying(20) DEFAULT 'CIF'::character varying,
    total_quote_amount numeric(18,2) DEFAULT 0,
    submission_deadline timestamp with time zone,
    magic_link_expires_at timestamp with time zone,
    is_deleted boolean DEFAULT false,
    updated_by uuid,
    version bigint DEFAULT 0,
    code character varying(64),
    CONSTRAINT chk_rfqs_eval CHECK (((evaluation_method)::text = ANY ((ARRAY['LOWEST_PRICE'::character varying, 'BEST_VALUE'::character varying, 'WEIGHTED_SCORE'::character varying, 'NEGOTIATION'::character varying])::text[]))),
    CONSTRAINT chk_rfqs_inco CHECK (((incoterms)::text = ANY ((ARRAY['FOB'::character varying, 'CIF'::character varying, 'EXW'::character varying, 'CFR'::character varying, 'CIP'::character varying, 'DDP'::character varying, 'DAP'::character varying, 'FCA'::character varying, 'CPT'::character varying, 'FAS'::character varying])::text[]))),
    CONSTRAINT chk_rfqs_ship CHECK (((shipping_method)::text = ANY ((ARRAY['SEA'::character varying, 'AIR'::character varying, 'RAIL'::character varying, 'ROAD'::character varying, 'MULTIMODAL'::character varying, 'EXPRESS'::character varying])::text[])))
);


ALTER TABLE public.rfqs OWNER TO mibid_admin;

--
-- Name: TABLE rfqs; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.rfqs IS 'Yêu cầu Báo giá chuẩn XNK. Hỗ trợ Multi-round bidding, Multiple evaluation methods';


--
-- Name: COLUMN rfqs.budget_amount; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON COLUMN public.rfqs.budget_amount IS 'Chỉ hiển thị nội bộ. Vendor KHÔNG được phép thấy trường này';


--
-- Name: COLUMN rfqs.evaluation_method; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON COLUMN public.rfqs.evaluation_method IS 'LOWEST_PRICE = Giá thấp nhất thắng. WEIGHTED_SCORE = Chấm điểm đa tiêu chí';


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.role_permissions (
    role_id uuid NOT NULL,
    feature_code character varying(100) NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO mibid_admin;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_system boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.roles OWNER TO mibid_admin;

--
-- Name: saas_features; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.saas_features (
    code character varying(50) NOT NULL,
    module_code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text
);


ALTER TABLE public.saas_features OWNER TO mibid_admin;

--
-- Name: saas_modules; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.saas_modules (
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.saas_modules OWNER TO mibid_admin;

--
-- Name: shipment_costs; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.shipment_costs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    shipment_id uuid NOT NULL,
    cost_type character varying(50) NOT NULL,
    description character varying(255) NOT NULL,
    currency character varying(10) DEFAULT 'USD'::character varying NOT NULL,
    amount numeric(15,2) NOT NULL,
    exchange_rate numeric(12,6) DEFAULT 1.000000,
    amount_base numeric(15,2),
    vendor_name character varying(200),
    invoice_number character varying(100),
    invoice_date date,
    is_estimated boolean DEFAULT true NOT NULL,
    notes text,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_sc_amount CHECK ((amount >= (0)::numeric)),
    CONSTRAINT chk_sc_type CHECK (((cost_type)::text = ANY ((ARRAY['FREIGHT'::character varying, 'THC'::character varying, 'CUSTOMS_FEE'::character varying, 'INSURANCE'::character varying, 'TRUCKING'::character varying, 'WAREHOUSING'::character varying, 'DOCUMENTATION'::character varying, 'INSPECTION'::character varying, 'DEMURRAGE'::character varying, 'DETENTION'::character varying, 'PORT_CHARGES'::character varying, 'OTHER'::character varying])::text[])))
);


ALTER TABLE public.shipment_costs OWNER TO mibid_admin;

--
-- Name: TABLE shipment_costs; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.shipment_costs IS 'Chi phí chi tiết từng lô hàng. Dùng tính P&L, so sánh Estimated vs Actual. Báo cáo chi phí logistics';


--
-- Name: shipment_milestones; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.shipment_milestones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    shipment_id uuid NOT NULL,
    milestone_type character varying(50) NOT NULL,
    sequence integer DEFAULT 0 NOT NULL,
    planned_date date NOT NULL,
    revised_date date,
    actual_date date,
    is_completed boolean DEFAULT false NOT NULL,
    responsible_role character varying(30),
    completed_by uuid,
    delay_days integer,
    delay_reason text,
    delay_category character varying(30),
    evidence_urls text[],
    location character varying(200),
    notes text,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    code character varying(50),
    name character varying(150),
    status character varying(50),
    seq_order integer,
    is_deleted boolean DEFAULT false,
    created_by uuid,
    version bigint DEFAULT 0,
    CONSTRAINT chk_sm_delay_cat CHECK (((delay_category IS NULL) OR ((delay_category)::text = ANY ((ARRAY['WEATHER'::character varying, 'PORT_CONGESTION'::character varying, 'CUSTOMS_HOLD'::character varying, 'VESSEL_DELAY'::character varying, 'DOCUMENTATION'::character varying, 'FORCE_MAJEURE'::character varying, 'INTERNAL'::character varying, 'OTHER'::character varying])::text[])))),
    CONSTRAINT chk_sm_type CHECK (((milestone_type)::text = ANY ((ARRAY['BOOKING_CONFIRMED'::character varying, 'CARGO_READY'::character varying, 'GATE_IN'::character varying, 'LOADED'::character varying, 'ETD'::character varying, 'IN_TRANSIT'::character varying, 'TRANSSHIPMENT'::character varying, 'ETA'::character varying, 'ARRIVED'::character varying, 'CUSTOMS_CLEARANCE'::character varying, 'DELIVERY_ORDER'::character varying, 'DELIVERED'::character varying, 'EMPTY_RETURN'::character varying])::text[])))
);


ALTER TABLE public.shipment_milestones OWNER TO mibid_admin;

--
-- Name: TABLE shipment_milestones; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.shipment_milestones IS 'Full Logistics Tracking: 13 milestone types, delay tracking, evidence uploads, auto delay-days';


--
-- Name: COLUMN shipment_milestones.delay_days; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON COLUMN public.shipment_milestones.delay_days IS 'Auto-calculate: actual_date - planned_date. Nếu > 0 = Trễ. Cronjob 8AM quét chưa hoàn thành -> Alert';


--
-- Name: shipments; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.shipments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    project_id uuid NOT NULL,
    shipment_code character varying(50),
    bl_number character varying(100),
    bl_type character varying(30),
    booking_number character varying(100),
    vessel_name character varying(200),
    voyage_number character varying(50),
    container_no character varying(50),
    container_type character varying(30),
    container_count integer DEFAULT 1,
    seal_number character varying(50),
    shipping_method character varying(30) DEFAULT 'SEA'::character varying NOT NULL,
    origin_port character varying(200),
    origin_country character varying(100),
    destination_port character varying(200),
    destination_country character varying(100),
    transit_ports text[],
    cargo_description text,
    total_packages integer,
    gross_weight_kg numeric(12,3),
    net_weight_kg numeric(12,3),
    total_cbm numeric(10,4),
    hs_codes text[],
    forwarder_name character varying(255),
    forwarder_contact character varying(150),
    forwarder_email character varying(150),
    shipping_line character varying(200),
    insurance_provider character varying(200),
    insurance_policy_no character varying(100),
    insured_value numeric(15,2),
    insurance_currency character varying(10) DEFAULT 'USD'::character varying,
    customs_broker character varying(200),
    customs_declaration_no character varying(100),
    customs_cleared_at timestamp with time zone,
    status character varying(30) DEFAULT 'DRAFT'::character varying NOT NULL,
    assigned_to uuid,
    notes text,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    project_name character varying(255),
    contract_no character varying(100),
    carrier character varying(150),
    pol character varying(150),
    pod character varying(150),
    etd date,
    eta date,
    contract_deadline date,
    equipment_summary text,
    supplier_name character varying(255),
    is_deleted boolean DEFAULT false,
    updated_by uuid,
    version bigint DEFAULT 0,
    customs_status character varying(50),
    customs_cleared_date date,
    in_transit_value_usd numeric(18,2) DEFAULT 0,
    in_transit_value_vnd numeric(18,2) DEFAULT 0,
    delay_reason text,
    voyage_no character varying(50),
    CONSTRAINT chk_s_bl_type CHECK (((bl_type IS NULL) OR ((bl_type)::text = ANY ((ARRAY['ORIGINAL'::character varying, 'SURRENDERED'::character varying, 'SEAWAY_BILL'::character varying, 'TELEX_RELEASE'::character varying, 'EXPRESS'::character varying])::text[])))),
    CONSTRAINT chk_s_ship_method CHECK (((shipping_method)::text = ANY ((ARRAY['SEA'::character varying, 'AIR'::character varying, 'RAIL'::character varying, 'ROAD'::character varying, 'MULTIMODAL'::character varying, 'EXPRESS'::character varying])::text[]))),
    CONSTRAINT chk_s_status CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'BOOKING'::character varying, 'BOOKED'::character varying, 'GATE_IN'::character varying, 'DEPARTED'::character varying, 'IN_TRANSIT'::character varying, 'ARRIVED'::character varying, 'CUSTOMS'::character varying, 'DELIVERING'::character varying, 'DELIVERED'::character varying, 'CANCELLED'::character varying])::text[])))
);


ALTER TABLE public.shipments OWNER TO mibid_admin;

--
-- Name: TABLE shipments; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.shipments IS 'Lô hàng XNK: Full thông tin vận đơn, container, hải quan, bảo hiểm, forwarder';


--
-- Name: COLUMN shipments.bl_type; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON COLUMN public.shipments.bl_type IS 'ORIGINAL = B/L gốc. SURRENDERED = Đã thu hồi. TELEX_RELEASE = Giải phóng điện tử';


--
-- Name: stage_checklist_items; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.stage_checklist_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    stage_id uuid,
    title character varying(255) NOT NULL,
    description text,
    is_required boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    doc_code character varying(100),
    assignee_role character varying(100),
    project_id uuid,
    stage_code character varying(50)
);


ALTER TABLE public.stage_checklist_items OWNER TO mibid_admin;

--
-- Name: TABLE stage_checklist_items; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.stage_checklist_items IS 'Checklist cấu hình theo Stage. User phải tick hết items required mới được chuyển bước';


--
-- Name: stage_doc_rules; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.stage_doc_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    stage_id uuid NOT NULL,
    doc_type_id uuid NOT NULL,
    requires_approval boolean DEFAULT false NOT NULL,
    is_hard_stop boolean DEFAULT true NOT NULL,
    min_version integer DEFAULT 1,
    max_age_days integer,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.stage_doc_rules OWNER TO mibid_admin;

--
-- Name: TABLE stage_doc_rules; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.stage_doc_rules IS 'Gatekeeper Rule gắn vào Stage: Để vào bước X phải có tài liệu loại Y với điều kiện Z';


--
-- Name: COLUMN stage_doc_rules.max_age_days; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON COLUMN public.stage_doc_rules.max_age_days IS 'Tài liệu phải mới. VD: CO không được cũ quá 90 ngày kể từ ngày upload';


--
-- Name: stage_notifications; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.stage_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    stage_id uuid NOT NULL,
    event_type character varying(30) NOT NULL,
    target_role character varying(30) NOT NULL,
    channel character varying(20) DEFAULT 'BOTH'::character varying NOT NULL,
    subject_template character varying(255),
    body_template text,
    delay_minutes integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_sn_channel CHECK (((channel)::text = ANY ((ARRAY['IN_APP'::character varying, 'EMAIL'::character varying, 'BOTH'::character varying])::text[]))),
    CONSTRAINT chk_sn_event CHECK (((event_type)::text = ANY ((ARRAY['ON_ENTER'::character varying, 'ON_EXIT'::character varying, 'SLA_WARNING'::character varying, 'SLA_BREACH'::character varying, 'TASK_OVERDUE'::character varying, 'DOC_UPLOADED'::character varying, 'DOC_REJECTED'::character varying])::text[])))
);


ALTER TABLE public.stage_notifications OWNER TO mibid_admin;

--
-- Name: TABLE stage_notifications; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.stage_notifications IS 'Cấu hình thông báo tự động: Khi vào bước X, gửi email cho Role Y với nội dung Template Z';


--
-- Name: subscription_invoices; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.subscription_invoices (
    id character varying(50) NOT NULL,
    tenant_id character varying(50) NOT NULL,
    subscription_id character varying(50),
    invoice_number character varying(50) NOT NULL,
    amount numeric(15,2) NOT NULL,
    currency character varying(10) DEFAULT 'VND'::character varying,
    status character varying(30) DEFAULT 'PENDING'::character varying,
    payment_method character varying(50),
    payment_date timestamp with time zone,
    due_date date NOT NULL,
    transaction_reference character varying(100),
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_code character varying(64)
);


ALTER TABLE public.subscription_invoices OWNER TO mibid_admin;

--
-- Name: subscription_notifications; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.subscription_notifications (
    id character varying(50) NOT NULL,
    tenant_id character varying(50) NOT NULL,
    subscription_id character varying(50),
    notification_type character varying(50) NOT NULL,
    recipient_email character varying(255),
    title character varying(255) NOT NULL,
    message text NOT NULL,
    days_remaining integer,
    sent_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'SENT'::character varying,
    tenant_code character varying(64)
);


ALTER TABLE public.subscription_notifications OWNER TO mibid_admin;

--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.subscription_plans (
    id character varying(50) DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    max_users integer DEFAULT 10 NOT NULL,
    max_storage_gb integer DEFAULT 10 NOT NULL,
    price numeric(15,2) DEFAULT 0 NOT NULL,
    currency character varying(10) DEFAULT 'USD'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    code character varying(50),
    monthly_price numeric(15,2) DEFAULT 0,
    yearly_price numeric(15,2) DEFAULT 0,
    max_machines integer DEFAULT 5,
    allowed_modules text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    description text
);


ALTER TABLE public.subscription_plans OWNER TO mibid_admin;

--
-- Name: supplier_partners; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.supplier_partners (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    code character varying(64) NOT NULL,
    name character varying(255) NOT NULL,
    tax_code character varying(50),
    country character varying(100),
    category character varying(100),
    rating numeric(3,1) DEFAULT 5.0,
    contact_person character varying(150),
    email character varying(150),
    phone character varying(50),
    status character varying(32) DEFAULT 'ACTIVE'::character varying,
    total_quotes_submitted integer DEFAULT 0,
    total_won_bids integer DEFAULT 0,
    iso_certified boolean DEFAULT true,
    is_deleted boolean DEFAULT false,
    version bigint DEFAULT 0,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.supplier_partners OWNER TO mibid_admin;

--
-- Name: system_config; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.system_config (
    config_key character varying(200) NOT NULL,
    config_value character varying(2000) NOT NULL,
    description character varying(500),
    data_type character varying(50) DEFAULT 'STRING'::character varying,
    is_active boolean DEFAULT true,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.system_config OWNER TO mibid_admin;

--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.system_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value text NOT NULL,
    value_type character varying(20) DEFAULT 'STRING'::character varying NOT NULL,
    category character varying(50) DEFAULT 'GENERAL'::character varying NOT NULL,
    description text,
    is_public boolean DEFAULT false NOT NULL,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_ss_type CHECK (((value_type)::text = ANY ((ARRAY['STRING'::character varying, 'NUMBER'::character varying, 'BOOLEAN'::character varying, 'JSON'::character varying, 'DATE'::character varying])::text[])))
);


ALTER TABLE public.system_settings OWNER TO mibid_admin;

--
-- Name: TABLE system_settings; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.system_settings IS 'Key-Value store cho cấu hình toàn hệ thống. VD: company_name, default_currency, smtp_host...';


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid,
    project_id character varying(100),
    project_name character varying(255),
    stage_id character varying(100),
    code character varying(64) NOT NULL,
    title character varying(255) NOT NULL,
    department_code character varying(64) DEFAULT 'TECHNICAL'::character varying NOT NULL,
    priority character varying(32) DEFAULT 'MEDIUM'::character varying,
    assignee_id character varying(100),
    assignee_name character varying(150),
    assignee_avatar character varying(255),
    due_at timestamp with time zone,
    is_mandatory boolean DEFAULT false,
    status character varying(32) DEFAULT 'TODO'::character varying NOT NULL,
    clarification_count integer DEFAULT 0,
    sla_status character varying(32) DEFAULT 'ON_TRACK'::character varying,
    sla_remaining_hours integer DEFAULT 24,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    is_deleted boolean DEFAULT false,
    version bigint DEFAULT 0,
    completed_at timestamp with time zone,
    evidence_docs jsonb DEFAULT '[]'::jsonb,
    gate_checklists jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.tasks OWNER TO mibid_admin;

--
-- Name: tenant_menu_permissions; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.tenant_menu_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    menu_id uuid,
    menu_code character varying(100),
    menu_name character varying(255),
    route_path character varying(255),
    module_code character varying(50),
    is_enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.tenant_menu_permissions OWNER TO mibid_admin;

--
-- Name: tenant_subscriptions; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.tenant_subscriptions (
    id character varying(50) DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying(50) NOT NULL,
    plan_id character varying(50) NOT NULL,
    start_date date DEFAULT now() NOT NULL,
    end_date date,
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    billing_cycle character varying(20) DEFAULT 'YEARLY'::character varying,
    grace_period_days integer DEFAULT 7,
    auto_renew boolean DEFAULT true,
    current_user_count integer DEFAULT 0,
    current_machine_count integer DEFAULT 0,
    last_notification_sent_at timestamp with time zone
);


ALTER TABLE public.tenant_subscriptions OWNER TO mibid_admin;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    domain character varying(255),
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    code character varying(64),
    tax_code character varying(32),
    contact_email character varying(255) DEFAULT 'contact@mibid.vn'::character varying,
    contact_phone character varying(32),
    storage_quota_gb integer DEFAULT 50,
    is_deleted boolean DEFAULT false,
    version bigint DEFAULT 0,
    created_by uuid,
    updated_by uuid,
    tenant_id uuid,
    CONSTRAINT chk_tenant_status CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'SUSPENDED'::character varying, 'CANCELLED'::character varying])::text[])))
);


ALTER TABLE public.tenants OWNER TO mibid_admin;

--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.user_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    session_token character varying(500) NOT NULL,
    refresh_token character varying(500),
    device_info character varying(300),
    ip_address inet,
    is_active boolean DEFAULT true NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    last_activity_at timestamp with time zone DEFAULT now(),
    revoked_at timestamp with time zone,
    revoked_reason character varying(50),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_us_revoke CHECK (((revoked_reason IS NULL) OR ((revoked_reason)::text = ANY ((ARRAY['LOGOUT'::character varying, 'EXPIRED'::character varying, 'ADMIN_REVOKE'::character varying, 'SECURITY'::character varying, 'PASSWORD_CHANGED'::character varying])::text[]))))
);


ALTER TABLE public.user_sessions OWNER TO mibid_admin;

--
-- Name: TABLE user_sessions; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.user_sessions IS 'Session management: Multi-device, force logout, security audit. Admin có thể revoke bất kỳ session nào';


--
-- Name: users; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    email character varying(150) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(150) NOT NULL,
    phone character varying(20),
    avatar_url character varying(500),
    department character varying(100),
    "position" character varying(100),
    employee_code character varying(50),
    direct_manager_id uuid,
    role_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    is_2fa_enabled boolean DEFAULT false NOT NULL,
    two_fa_secret character varying(100),
    password_changed_at timestamp with time zone,
    failed_login_count integer DEFAULT 0 NOT NULL,
    locked_until timestamp with time zone,
    last_login_at timestamp with time zone,
    last_login_ip inet,
    locale character varying(10) DEFAULT 'vi'::character varying NOT NULL,
    timezone character varying(50) DEFAULT 'Asia/Ho_Chi_Minh'::character varying NOT NULL,
    email_notifications boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    username character varying(128),
    role character varying(64) DEFAULT 'ADMIN'::character varying,
    status character varying(32) DEFAULT 'ACTIVE'::character varying,
    is_deleted boolean DEFAULT false,
    version bigint DEFAULT 0,
    created_by uuid,
    updated_by uuid
);


ALTER TABLE public.users OWNER TO mibid_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.users IS 'Tài khoản hệ thống Mibid. Hỗ trợ 2FA, Auto-lock, Escalation qua direct_manager_id';


--
-- Name: COLUMN users.failed_login_count; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON COLUMN public.users.failed_login_count IS 'Sau 5 lần sai, locked_until = NOW() + 30 phút. Reset về 0 khi login thành công';


--
-- Name: v_overdue_milestones; Type: VIEW; Schema: public; Owner: mibid_admin
--

CREATE VIEW public.v_overdue_milestones AS
 SELECT sm.id AS milestone_id,
    sm.milestone_type,
    sm.planned_date,
    (CURRENT_DATE - sm.planned_date) AS overdue_days,
    s.shipment_code,
    s.bl_number,
    s.project_id,
    p.project_code,
    p.name AS project_name
   FROM ((public.shipment_milestones sm
     JOIN public.shipments s ON ((sm.shipment_id = s.id)))
     JOIN public.projects p ON ((s.project_id = p.id)))
  WHERE ((sm.is_completed = false) AND (sm.planned_date < CURRENT_DATE) AND ((s.status)::text <> ALL ((ARRAY['DELIVERED'::character varying, 'CANCELLED'::character varying])::text[])));


ALTER TABLE public.v_overdue_milestones OWNER TO mibid_admin;

--
-- Name: workflow_stages; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.workflow_stages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    workflow_id uuid NOT NULL,
    version_id uuid,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    sequence integer NOT NULL,
    stage_type character varying(20) DEFAULT 'MANUAL'::character varying NOT NULL,
    color character varying(20) DEFAULT '#3B82F6'::character varying,
    icon character varying(50),
    sla_days integer,
    sla_warning_days integer,
    sla_action character varying(30) DEFAULT 'WARN'::character varying,
    is_initial boolean DEFAULT false NOT NULL,
    is_terminal boolean DEFAULT false NOT NULL,
    terminal_type character varying(20),
    allow_skip boolean DEFAULT false NOT NULL,
    allow_return boolean DEFAULT true NOT NULL,
    require_all_tasks boolean DEFAULT false NOT NULL,
    require_approval boolean DEFAULT false NOT NULL,
    approval_role character varying(30),
    auto_assign_role character varying(30),
    on_enter_webhook character varying(500),
    on_exit_webhook character varying(500),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_wfs_sla_action CHECK (((sla_action)::text = ANY ((ARRAY['WARN'::character varying, 'ESCALATE'::character varying, 'AUTO_MOVE'::character varying, 'BLOCK'::character varying])::text[]))),
    CONSTRAINT chk_wfs_terminal CHECK (((terminal_type IS NULL) OR ((terminal_type)::text = ANY ((ARRAY['SUCCESS'::character varying, 'FAILURE'::character varying])::text[])))),
    CONSTRAINT chk_wfs_type CHECK (((stage_type)::text = ANY ((ARRAY['MANUAL'::character varying, 'AUTOMATIC'::character varying, 'APPROVAL'::character varying, 'PARALLEL'::character varying, 'MILESTONE'::character varying])::text[])))
);


ALTER TABLE public.workflow_stages OWNER TO mibid_admin;

--
-- Name: TABLE workflow_stages; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.workflow_stages IS 'Định nghĩa bước trong Workflow. Hỗ trợ SLA, Auto-assign, Approval gate, Webhook integration';


--
-- Name: COLUMN workflow_stages.stage_type; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON COLUMN public.workflow_stages.stage_type IS 'MANUAL = User kéo thẻ. AUTOMATIC = Tự chuyển khi đủ điều kiện. APPROVAL = Cần duyệt. MILESTONE = Mốc đánh dấu';


--
-- Name: COLUMN workflow_stages.sla_action; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON COLUMN public.workflow_stages.sla_action IS 'WARN = Cảnh báo vàng. ESCALATE = Gửi lên Manager. AUTO_MOVE = Tự chuyển bước. BLOCK = Khóa dự án';


--
-- Name: v_project_sla_status; Type: VIEW; Schema: public; Owner: mibid_admin
--

CREATE VIEW public.v_project_sla_status AS
 SELECT p.id AS project_id,
    p.project_code,
    p.name AS project_name,
    ws.name AS current_stage,
    ws.sla_days,
    p.stage_entered_at,
    (EXTRACT(day FROM (now() - p.stage_entered_at)))::integer AS days_in_stage,
        CASE
            WHEN (ws.sla_days IS NULL) THEN 'NO_SLA'::text
            WHEN (EXTRACT(day FROM (now() - p.stage_entered_at)) > (ws.sla_days)::numeric) THEN 'BREACHED'::text
            WHEN (EXTRACT(day FROM (now() - p.stage_entered_at)) > ((ws.sla_days - COALESCE(ws.sla_warning_days, 0)))::numeric) THEN 'WARNING'::text
            ELSE 'ON_TRACK'::text
        END AS sla_status
   FROM (public.projects p
     JOIN public.workflow_stages ws ON ((p.current_stage_id = ws.id)))
  WHERE ((p.status)::text = 'ACTIVE'::text);


ALTER TABLE public.v_project_sla_status OWNER TO mibid_admin;

--
-- Name: workflow_definitions; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.workflow_definitions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    version character varying(50),
    status character varying(50) DEFAULT 'ACTIVE'::character varying,
    tenant_id uuid,
    tenant_name character varying(255),
    description text,
    nodes_json text,
    edges_json text,
    is_template boolean DEFAULT false,
    template_category character varying(100),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_deleted boolean DEFAULT false
);


ALTER TABLE public.workflow_definitions OWNER TO mibid_admin;

--
-- Name: workflow_stage_tasks; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.workflow_stage_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    stage_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    default_role character varying(30) NOT NULL,
    priority character varying(20) DEFAULT 'MEDIUM'::character varying NOT NULL,
    due_days_offset integer DEFAULT 3 NOT NULL,
    depends_on_task_id uuid,
    is_blocking boolean DEFAULT false NOT NULL,
    auto_assign_to character varying(30),
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_wst_priority CHECK (((priority)::text = ANY ((ARRAY['LOW'::character varying, 'MEDIUM'::character varying, 'HIGH'::character varying, 'URGENT'::character varying])::text[]))),
    CONSTRAINT chk_wst_role CHECK (((default_role)::text = ANY ((ARRAY['OWNER'::character varying, 'SOURCING_LEAD'::character varying, 'SALES_EXEC'::character varying, 'LOGISTICS_EXEC'::character varying, 'FINANCE'::character varying, 'QC'::character varying, 'MEMBER'::character varying])::text[])))
);


ALTER TABLE public.workflow_stage_tasks OWNER TO mibid_admin;

--
-- Name: TABLE workflow_stage_tasks; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.workflow_stage_tasks IS 'Template Task tự động sinh khi chuyển bước. Hỗ trợ dependency chain và blocking';


--
-- Name: COLUMN workflow_stage_tasks.due_days_offset; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON COLUMN public.workflow_stage_tasks.due_days_offset IS 'Deadline = ngày chuyển bước + offset ngày. VD: 3 = hạn 3 ngày sau khi vào Stage';


--
-- Name: COLUMN workflow_stage_tasks.is_blocking; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON COLUMN public.workflow_stage_tasks.is_blocking IS 'TRUE = Nếu task này chưa DONE thì không được chuyển sang Stage tiếp theo';


--
-- Name: workflow_transitions; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.workflow_transitions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    workflow_id uuid NOT NULL,
    version_id uuid,
    from_stage_id uuid NOT NULL,
    to_stage_id uuid NOT NULL,
    name character varying(100),
    description text,
    condition_type character varying(30) DEFAULT 'NONE'::character varying NOT NULL,
    condition_config jsonb,
    allowed_roles text[],
    requires_confirmation boolean DEFAULT true NOT NULL,
    requires_comment boolean DEFAULT false NOT NULL,
    check_documents boolean DEFAULT false NOT NULL,
    check_tasks boolean DEFAULT false NOT NULL,
    auto_actions jsonb,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_wt_cond CHECK (((condition_type)::text = ANY ((ARRAY['NONE'::character varying, 'ALL_DOCS'::character varying, 'ALL_TASKS'::character varying, 'CUSTOM_RULE'::character varying, 'APPROVAL_GRANTED'::character varying, 'AND'::character varying, 'OR'::character varying])::text[]))),
    CONSTRAINT chk_wt_no_self CHECK ((from_stage_id <> to_stage_id))
);


ALTER TABLE public.workflow_transitions OWNER TO mibid_admin;

--
-- Name: TABLE workflow_transitions; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.workflow_transitions IS 'Đồ thị chuyển bước: Cung (Edge) nối 2 Stage. Cho phép cấu hình phi tuyến tính (VD: quay lại, bỏ qua)';


--
-- Name: COLUMN workflow_transitions.condition_config; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON COLUMN public.workflow_transitions.condition_config IS 'JSONB cấu hình điều kiện. VD: {"min_task_completion_pct": 80, "required_doc_types": ["uuid1","uuid2"]}';


--
-- Name: COLUMN workflow_transitions.auto_actions; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON COLUMN public.workflow_transitions.auto_actions IS 'JSONB mảng hành động tự động. VD: [{"type":"SEND_EMAIL","template":"rfq_closed"},{"type":"CREATE_TASK","title":"Kiểm tra HĐ"}]';


--
-- Name: workflow_versions; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.workflow_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    workflow_id uuid NOT NULL,
    version_number integer NOT NULL,
    version_label character varying(50),
    status character varying(20) DEFAULT 'DRAFT'::character varying NOT NULL,
    change_log text,
    published_at timestamp with time zone,
    published_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_wv_status CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'PUBLISHED'::character varying, 'ARCHIVED'::character varying, 'DEPRECATED'::character varying])::text[])))
);


ALTER TABLE public.workflow_versions OWNER TO mibid_admin;

--
-- Name: TABLE workflow_versions; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.workflow_versions IS 'Versioning: Sửa workflow không ảnh hưởng dự án đang chạy trên version cũ';


--
-- Name: workflows; Type: TABLE; Schema: public; Owner: mibid_admin
--

CREATE TABLE public.workflows (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    definition_json text,
    nodes_json text,
    edges_json text,
    is_template boolean DEFAULT false,
    template_category character varying(100),
    template_id character varying(100),
    tenant_name character varying(255),
    version character varying(50),
    is_deleted boolean DEFAULT false,
    updated_by uuid
);


ALTER TABLE public.workflows OWNER TO mibid_admin;

--
-- Name: TABLE workflows; Type: COMMENT; Schema: public; Owner: mibid_admin
--

COMMENT ON TABLE public.workflows IS 'Mỗi record là một Template Luồng công việc (VD: Luồng XNK Thép, Luồng XNK Nông sản)';


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.activity_logs (id, tenant_id, user_id, session_id, action, entity_type, entity_id, project_id, description, old_values, new_values, metadata, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: app_menus; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.app_menus (id, code, created_at, icon, is_active, is_system, module_code, parent_id, path, required_permission, sort_order, title, updated_at) FROM stdin;
MENU-DASHBOARD	dashboard	2026-09-02 04:45:42.894417	LayoutDashboard	t	t	CORE	\N	/dashboard	DASHBOARD:VIEW	1	Tổng Quan Báo Cáo	2026-09-02 04:45:42.894417
MENU-PROJECTS	projects	2026-09-02 04:45:42.894417	Briefcase	t	f	BIDDING	\N	/projects	PROJECT:VIEW	2	Danh Sách Gói Thầu	2026-09-02 04:45:42.894417
MENU-SOURCING	sourcing	2026-09-02 04:45:42.894417	FileSpreadsheet	t	f	SOURCING	\N	/sourcing	SOURCING:VIEW	6	Sourcing & Báo Giá NCC (RFQ)	2026-09-02 04:45:42.894417
MENU-MATRIX	matrix	2026-09-02 04:45:42.894417	Layers	t	f	SOURCING	\N	/matrix	MATRIX:VIEW	7	Ma Trận So Sánh Báo Giá	2026-09-02 04:45:42.894417
MENU-TASKS	tasks	2026-09-02 04:45:42.894417	CheckSquare	t	f	BIDDING	\N	/tasks	TASK:VIEW	8	Phân Công & Nhiệm Vụ	2026-09-02 04:45:42.894417
MENU-LOGISTICS	logistics	2026-09-02 04:45:42.894417	Truck	t	f	LOGISTICS	\N	/logistics	LOGISTICS:VIEW	9	Vận Đơn & Chi Phí XNK	2026-09-02 04:45:42.894417
MENU-DMS	dms	2026-09-02 04:45:42.894417	FolderLock	t	f	DMS	\N	/dms	DMS:VIEW	10	Kho Hồ Sơ & Tài Liệu Số (DMS)	2026-09-02 04:45:42.894417
MENU-ANALYTICS	analytics	2026-09-02 04:45:42.894417	BarChart3	t	f	ANALYTICS	\N	/analytics	ANALYTICS:VIEW	11	Phân Tích Thống Kê & Tỷ Lệ Trúng	2026-09-02 04:45:42.894417
MENU-USERS	users	2026-09-02 04:45:42.894417	Users	t	t	SYSTEM_ADMIN	\N	/users	SYS:USER:VIEW	12	Quản Trị Người Dùng & Nhân Sự	2026-09-02 04:45:42.894417
MENU-ROLES	roles	2026-09-02 04:45:42.894417	Shield	t	t	SYSTEM_ADMIN	\N	/roles	SYS:ROLE:VIEW	13	Nhóm Quyền & Ma Trận Phân Quyền	2026-09-02 04:45:42.894417
MENU-TENANTS	tenants	2026-09-02 04:45:42.894417	Building2	t	t	SYSTEM_ADMIN	\N	/tenants	SYS:TENANT:VIEW	14	Cấu Hình Doanh Nghiệp (Tenants)	2026-09-02 04:45:42.894417
MENU-MENUS	menus	2026-09-02 04:45:42.894417	FolderTree	t	t	SYSTEM_ADMIN	\N	/menus	SYS:MENU:VIEW	15	Quản Lý Menu & Route Động	2026-09-02 04:45:42.894417
MENU-SUBSCRIPTIONS	subscriptions	2026-09-02 04:45:42.894417	CreditCard	t	t	SAAS_BILLING	\N	/subscriptions	SYS:SUBSCRIPTION:VIEW	16	Gói Cước & Thuê Bao SaaS	2026-09-02 04:45:42.894417
MENU-INTEGRATION	integration	2026-09-02 04:45:42.894417	Network	t	f	SYSTEM_ADMIN	\N	/integration	SYS:INTEGRATION:VIEW	17	Cổng Tích Hợp Ngoại Vi & ERP	2026-09-02 04:45:42.894417
MENU-KANBAN	kanban	2026-09-02 04:45:42.894417	Kanban	t	f	BIDDING	\N	/kanban	KANBAN:VIEW	3	Tiến Độ Kanban	2026-09-02 04:45:42.894417
MENU-WORKFLOW	workflow	2026-09-02 04:45:42.894417	Layers	t	f	BIDDING	\N	/workflow	COMMAND_CENTER:VIEW	4	Trung Tâm Điều Phối	2026-09-02 05:19:24.06397
MENU-WORKFLOWS	workflows	2026-09-02 05:19:24.071096	GitFork	t	f	BIDDING	\N	/workflows	WORKFLOW:VIEW	5	Quy Trình & Mẫu Luồng	2026-09-02 05:19:24.071096
\.


--
-- Data for Name: doc_types; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.doc_types (id, tenant_id, name, code, description, category, allowed_extensions, max_file_size_mb, is_active, sort_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: document_audit_logs; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.document_audit_logs (id, tenant_id, document_id, action, old_status, new_status, performed_by, comment, ip_address, created_at) FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.documents (id, created_at, created_by, is_deleted, tenant_id, updated_at, updated_by, version, approval_status, approved_by, document_type_code, effective_from, expires_at, file_size_bytes, mime_type, s3_object_key, title) FROM stdin;
\.


--
-- Data for Name: file_attachments; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.file_attachments (id, tenant_id, entity_type, entity_id, file_name, original_name, file_url, file_size_bytes, mime_type, uploaded_by, created_at) FROM stdin;
\.


--
-- Data for Name: file_sync_logs; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.file_sync_logs (id, created_at, error_count, error_log_json, file_type, name, status, success_count, tenant_id, total_records) FROM stdin;
FILE-SYNC-20260901-001	2026-09-01 15:38:18.97913	0	\N	BOQ_MATERIAL_IMPORT	IMPORT_BOQ_220KV_EEMC_20260901.csv	COMPLETED	1250	11111111-1111-1111-1111-111111111111	1250
FILE-SYNC-20260901-002	2026-09-01 13:38:18.97913	0	\N	VENDOR_QUOTATION_BATCH	VENDOR_QUOTES_SIEMENS_20260901.xlsx	COMPLETED	480	11111111-1111-1111-1111-111111111111	480
FILE-SYNC-20260901-003	2026-09-01 10:38:18.97913	0	\N	GL_INVOICE_SYNC	INVOICE_EXPORT_ORACLE_20260901.dat	COMPLETED	320	11111111-1111-1111-1111-111111111111	320
\.


--
-- Data for Name: idempotent_event_logs; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.idempotent_event_logs (id, event_type, expire_at, processed_at, source_system, tenant_id) FROM stdin;
\.


--
-- Data for Name: integration_endpoints; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.integration_endpoints (id, auth_config, created_at, endpoint_url, integration_mode, is_active, last_sync_at, mapping_schema, name, sync_status, system_type, tenant_id, updated_at) FROM stdin;
EP-SAP-S4HANA	{"sasl_mechanism": "SCRAM-SHA-512", "username": "mibid_connector", "ssl_enabled": true}	2026-09-01 16:41:16.149041	https://sap-gateway.eemc.mibid.vn:8443/sap/bc/srt/rfc	KAFKA_STREAMING	t	2026-09-01 16:38:16.149041	{"BANFN": "rfq_code", "TXZ01": "material_name", "MENGE": "quantity", "NETPR": "unit_price"}	Cổng Tích Hợp SAP S/4HANA ERP (Quản Trị Yêu Cầu Mua Sắm PR/PO)	HEALTHY	SAP_ERP	11111111-1111-1111-1111-111111111111	2026-09-01 16:41:16.149041
EP-VNACCS-CUSTOMS	{"auth_type": "MUTUAL_TLS", "cert_alias": "mibid_vnaccs_cert_2026"}	2026-09-01 16:41:16.149041	https://customs.gov.vn/api/v2/declarations/status	REST_WEBHOOK	t	2026-09-01 16:26:16.149041	{"so_tk": "customs_declaration_no", "ma_lh": "type_code", "ngay_dk": "registration_date", "luong_tk": "channel"}	Cổng Hải Quan Điện Tử Quốc Gia VNACCS/VCIS (Tờ Khai & Thông Quan)	HEALTHY	VNACCS_CUSTOMS	11111111-1111-1111-1111-111111111111	2026-09-01 16:41:16.149041
EP-ORACLE-FINANCE	{"auth_type": "SSH_KEY", "key_fingerprint": "SHA256:7m8Xz9Kw..."}	2026-09-01 16:41:16.149041	sftp://sftp-finance.eemc.mibid.vn:2222/inbound/invoices	SFTP_BATCH	t	2026-09-01 15:56:16.149041	{"INVOICE_NUM": "invoice_number", "VENDOR_SITE": "supplier_code", "AMOUNT": "total_amount"}	Hệ Thống Kế Toán Quản Trị Oracle Financials (Hóa Đơn & Bảo Lãnh)	HEALTHY	ORACLE_EBS	11111111-1111-1111-1111-111111111111	2026-09-01 16:41:16.149041
EP-FAST-ACCOUNTING	{"api_key_header": "X-Fast-Api-Token", "hmac_sha256": true}	2026-09-01 16:41:16.149041	https://fast.eemc.com.vn/api/v1/gl-entries/sync	REST_WEBHOOK	t	2026-09-01 14:41:16.149041	{"ma_ct": "voucher_code", "dien_giai": "description", "ps_no": "debit_amount", "ps_co": "credit_amount"}	Hệ Thống Kế Toán Doanh Nghiệp FAST Business Online (Hạch Toán Chi Phí Gói Thầu)	HEALTHY	FAST_ERP	11111111-1111-1111-1111-111111111111	2026-09-01 16:41:16.149041
\.


--
-- Data for Name: magic_links; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.magic_links (id, tenant_id, rfq_id, rfq_vendor_id, vendor_email, vendor_name, token, status, expires_at, sent_at, first_opened_at, used_at, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.notifications (id, tenant_id, recipient_id, title, body, type, priority, reference_type, reference_id, action_url, is_read, read_at, is_archived, channel, email_sent_at, email_status, group_key, created_at) FROM stdin;
\.


--
-- Data for Name: outbox_events; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.outbox_events (id, aggregate_id, aggregate_type, created_at, event_type, payload, processed_at, retry_count, status, tenant_id) FROM stdin;
88888888-0001-0000-0000-000000000001	11111111-0001-0000-0000-000000000001	PROJECT	2026-09-01 14:38:18.97913	TENDER_STAGE_TRANSITIONED	{"projectId": "11111111-0001-0000-0000-000000000001", "projectCode": "DA-2026-EEMC-220KV", "fromStage": "STAGE_PREPARATION", "toStage": "STAGE_SOURCING", "timestamp": "2026-09-01T08:00:00Z"}	2026-09-01 14:38:18.97913	0	COMPLETED	11111111-1111-1111-1111-111111111111
88888888-0002-0000-0000-000000000002	22222222-0001-0000-0000-000000000001	RFQ	2026-09-01 15:38:18.97913	VENDOR_QUOTATION_SUBMITTED	{"rfqCode": "RFQ-2026-SIEMENS-01", "supplierCode": "PART-1001", "quoteAmountUsd": 1450000, "incoterm": "CIF_HAIPHONG"}	2026-09-01 15:38:18.97913	0	COMPLETED	11111111-1111-1111-1111-111111111111
\.


--
-- Data for Name: partner_onboarding_requests; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.partner_onboarding_requests (id, tenant_id, company_name, tax_code, country, category, contact_person, email, phone, cert_file_name, status, submitted_at, review_notes, is_deleted, version, created_by, updated_by, created_at, updated_at) FROM stdin;
55555555-0001-0000-0000-000000000001	11111111-1111-1111-1111-111111111111	Schneider Electric Energy Vietnam	0302488349	Việt Nam	Máy cắt trung áp & Relay Sepam	Lê Hữu Phúc	phuc.le@se.com	+84 28 3520 3000	ISO9001_Schneider_2026.pdf	PENDING_APPROVAL	2026-09-01 16:34:25.282411+00	Hồ sơ năng lực đính kèm đạt chuẩn ISO 9001:2015	f	0	\N	\N	2026-09-01 16:34:25.282411+00	2026-09-01 16:34:25.282411+00
55555555-0002-0000-0000-000000000002	11111111-1111-1111-1111-111111111111	LS Electric Co., Ltd	138-81-04289	Hàn Quốc	Thiết bị đóng cắt Chân không VCB 24kV	Park Ji-sung	global@lselectric.co.kr	+82 2 2034 4611	Cert_KEMA_TypeTest_2025.pdf	PENDING_APPROVAL	2026-09-01 16:34:25.282411+00	Đã thẩm tra chứng chỉ kiểm định KEMA Hà Lan	f	0	\N	\N	2026-09-01 16:34:25.282411+00	2026-09-01 16:34:25.282411+00
\.


--
-- Data for Name: partner_support_tickets; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.partner_support_tickets (id, tenant_id, ticket_code, partner_name, partner_email, rfq_code, issue_type, status, requested_at, current_pin, is_deleted, version, created_by, updated_by, created_at, updated_at) FROM stdin;
66666666-0001-0000-0000-000000000001	11111111-1111-1111-1111-111111111111	TCK-2026-081	Siemens Energy AG	tender@siemens-energy.de	RFQ-2026-SIEMENS-01	FORGOT_PIN	OPEN	2026-09-01 16:34:25.282411+00	892415	f	0	\N	\N	2026-09-01 16:34:25.282411+00	2026-09-01 16:34:25.282411+00
66666666-0002-0000-0000-000000000002	11111111-1111-1111-1111-111111111111	TCK-2026-082	Hitachi Energy Ltd	bids@hitachienergy.com	RFQ-2026-ABB-02	EXPIRED_LINK	OPEN	2026-09-01 16:34:25.282411+00	314902	f	0	\N	\N	2026-09-01 16:34:25.282411+00	2026-09-01 16:34:25.282411+00
\.


--
-- Data for Name: plan_features; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.plan_features (plan_id, feature_code) FROM stdin;
\.


--
-- Data for Name: project_checklist_status; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.project_checklist_status (id, tenant_id, project_id, checklist_item_id, is_checked, checked_by, checked_at, notes) FROM stdin;
62c88053-8ddc-4582-a75f-1a30f1cd2485	11111111-1111-1111-1111-111111111111	11111111-0001-0000-0000-000000000001	7b0fe487-c2fe-4720-bcee-72a6f91d6783	t	\N	2026-09-02 05:24:32.423293+00	\N
ba95a351-fd3f-44b4-a883-63614922f049	11111111-1111-1111-1111-111111111111	11111111-0001-0000-0000-000000000001	659e16fb-787b-4ea5-81c9-04539b94c25a	t	\N	2026-09-02 05:24:32.423293+00	\N
533b15f6-abbe-40ee-8281-0a76a527b7cd	11111111-1111-1111-1111-111111111111	11111111-0001-0000-0000-000000000001	d69893d2-c3c2-4792-a3f9-e3d221b4c2be	t	\N	2026-09-02 05:24:32.423293+00	\N
81d6f86e-53b6-4804-8d61-61f2e2230591	11111111-1111-1111-1111-111111111111	11111111-0002-0000-0000-000000000002	c2a68c88-90c8-42ef-8c8e-489ce988a870	t	\N	2026-09-02 05:24:32.423293+00	\N
9069febe-c050-497b-b6a4-084e43a660a5	11111111-1111-1111-1111-111111111111	11111111-0002-0000-0000-000000000002	221fef3b-2c2b-4080-9b48-5fa5001a8154	t	\N	2026-09-02 05:24:32.423293+00	\N
331505d1-0d4e-4aab-a92d-3ab88b66c3e4	11111111-1111-1111-1111-111111111111	11111111-0003-0000-0000-000000000003	b34851db-0488-4ba4-963c-4b9518eaa60e	t	\N	2026-09-02 05:24:32.423293+00	\N
15884a7c-8f1a-4e8d-b9d0-89eb6701e0bf	11111111-1111-1111-1111-111111111111	11111111-0003-0000-0000-000000000003	3973815b-9f21-4d0c-bc0c-1fb25e9a87e6	t	\N	2026-09-02 05:24:32.423293+00	\N
ae018464-1a72-46d6-8677-550ddbb395d9	11111111-1111-1111-1111-111111111111	11111111-0004-0000-0000-000000000004	7ac053c3-181c-427c-8a16-dce39759aacc	t	\N	2026-09-02 05:24:32.423293+00	\N
a9c09906-180f-446f-a054-8d1867057d9d	11111111-1111-1111-1111-111111111111	11111111-0004-0000-0000-000000000004	60cd02c7-f975-41c9-91c4-ca4bc1087234	t	\N	2026-09-02 05:24:32.423293+00	\N
\.


--
-- Data for Name: project_comments; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.project_comments (id, tenant_id, project_id, parent_id, author_id, content, attachment_urls, is_internal, is_edited, edited_at, created_at) FROM stdin;
\.


--
-- Data for Name: project_documents; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.project_documents (id, tenant_id, project_id, doc_type_id, parent_id, file_name, original_name, file_url, file_size_bytes, mime_type, checksum_sha256, version, document_date, expiry_date, reference_number, tags, description, status, uploaded_by, reviewed_by, reviewed_at, review_comment, rejection_count, is_confidential, download_count, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: project_members; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.project_members (id, tenant_id, project_id, user_id, project_role, is_primary, can_edit, can_approve, can_transition, notifications_enabled, joined_at, removed_at, added_by) FROM stdin;
\.


--
-- Data for Name: project_tasks; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.project_tasks (id, tenant_id, project_id, stage_id, parent_id, task_code, title, description, category, assignee_id, reviewer_id, watchers, priority, status, is_auto_generated, source_template_id, start_date, due_date, completed_at, estimated_hours, actual_hours, attachment_urls, result_notes, comments_count, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: project_transition_logs; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.project_transition_logs (id, tenant_id, project_id, transition_id, from_stage_id, to_stage_id, transitioned_by, is_forced, comment, duration_hours, blocked_reasons, checklist_snapshot, doc_compliance, created_at) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.projects (id, tenant_id, project_code, name, description, workflow_id, workflow_version_id, current_stage_id, stage_entered_at, status, created_by, created_at, updated_at, is_deleted, updated_by, version, bid_submission_deadline, code, currency, estimated_budget, investor_type, manager_id, procurement_method, investor_name, tender_type, stage_enum, manager_name, completed_tasks, total_tasks, industry_sector) FROM stdin;
11111111-0002-0000-0000-000000000002	11111111-1111-1111-1111-111111111111	DA-2026-PVN-NT34	Gói thầu EPC Quốc tế Thiết bị Cơ Điện Nhà máy Điện Nhơn Trạch 3 & 4	\N	7d158d18-2d03-4ec3-b9b5-ea275a847c15	\N	\N	\N	IN_PROGRESS	\N	2026-09-01 16:23:20.717027+00	2026-09-02 05:10:00.906847+00	f	\N	0	2026-10-01 16:23:20.717027	DA-2026-PVN-NT34	VND	320000000000.00	\N	\N	\N	Tập đoàn Dầu Khí Quốc Gia Việt Nam (PVN)	TENANT_PARTICIPATING	STAGE_DOSSIER_PREP	Trần Thị Thu Thảo	6	15	\N
11111111-0001-0000-0000-000000000001	11111111-1111-1111-1111-111111111111	DA-2026-EEMC-220KV	Dự án Cung cấp & Lắp đặt Máy Biến Áp 220kV - 250MVA Trạm Biến Áp Đông Anh	\N	cb8a1ddb-7edf-4447-ad67-6c348df5b0cd	\N	\N	\N	IN_PROGRESS	\N	2026-09-01 16:23:20.717027+00	2026-09-02 05:10:04.383109+00	f	\N	1	2026-09-19 16:23:20.717027	DA-2026-EEMC-220KV	VND	185000000000.00	\N	\N	\N	Tổng Công ty Truyền tải điện Quốc gia (EVNNPT)	TENANT_PARTICIPATING	STAGE_SOURCING	Nguyễn Văn Hùng	8	12	\N
11111111-0003-0000-0000-000000000003	11111111-1111-1111-1111-111111111111	DA-2026-EVN-TB	Gói thầu Mua sắm Sứ Xuyên & Cáp Ngầm Trung Thế 110kV Miền Bắc	\N	bef77039-9f57-47dd-bb53-b05ab3a6e821	\N	\N	\N	IN_PROGRESS	\N	2026-09-01 16:23:20.717027+00	2026-09-02 05:10:00.906847+00	f	\N	0	2026-09-13 16:23:20.717027	DA-2026-EVN-TB	VND	45000000000.00	\N	\N	\N	Tổng Công ty Điện lực Miền Bắc (EVNNPC)	TENANT_ISSUED	STAGE_PREPARATION	Phạm Hoàng Long	2	8	\N
11111111-0004-0000-0000-000000000004	11111111-1111-1111-1111-111111111111	DA-2026-HANOI-METRO	Gói thầu Thiết bị Thông tin Tín hiệu Tuyến Metro Số 3 Hà Nội	\N	fcad2497-cc41-4999-abc5-0065647294e9	\N	\N	\N	IN_PROGRESS	\N	2026-09-01 16:23:20.717027+00	2026-09-02 05:10:00.906847+00	f	\N	0	2026-09-08 16:23:20.717027	DA-2026-HANOI-METRO	VND	140000000000.00	\N	\N	\N	Ban Quản lý Đường sắt Đô thị Hà Nội (MRB)	TENANT_PARTICIPATING	STAGE_INTERNAL_REVIEW	Lê Quốc Tuấn	8	10	\N
\.


--
-- Data for Name: quotation_line_items; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.quotation_line_items (id, tenant_id, quotation_id, rfq_item_id, quantity_offered, unit_price, discount_pct, tax_pct, total_price, brand_offered, model_offered, origin_country, hs_code, packaging_details, weight_kg, dimensions_cm, cbm, lead_time_days, moq, warranty_months, notes, attachment_urls, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.quotations (id, tenant_id, rfq_id, magic_link_id, rfq_vendor_id, quotation_code, vendor_email, vendor_name, vendor_company, vendor_phone, vendor_address, currency, exchange_rate, subtotal, discount_pct, discount_amount, tax_pct, tax_amount, shipping_cost, insurance_cost, other_charges, grand_total, payment_terms, incoterms_offered, delivery_terms, warranty_terms, warranty_months, lead_time_days, eta_date, quote_valid_until, moq, production_capacity, certifications, origin_country, document_ids, attachment_urls, internal_score, score_breakdown, internal_notes, comparison_rank, status, rejection_reason, approved_by, approved_at, submitted_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: rfq_evaluation_criteria; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.rfq_evaluation_criteria (id, tenant_id, rfq_id, name, weight_pct, description, sort_order, created_at) FROM stdin;
\.


--
-- Data for Name: rfq_line_items; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.rfq_line_items (id, tenant_id, rfq_id, item_code, hs_code, description, brand_manufacturer, model_number, origin_country, quantity, uom, min_order_qty, max_order_qty, specifications, quality_standard, packaging_req, certification_req, sample_required, sample_qty, target_unit_price, attachment_urls, sort_order, created_at, updated_at, created_by, updated_by, is_deleted, version) FROM stdin;
55555555-0001-0000-0000-000000000001	11111111-1111-1111-1111-111111111111	33333333-0001-0000-0000-000000000001	GIS-220KV-CB	\N	Máy cắt hợp bộ GIS 220kV	\N	\N	Germany	3.00	Bộ	\N	\N	Điện áp định mức 245kV, dòng định mức 3150A, dòng cắt ngắn mạch 40kA/3s. Tiêu chuẩn IEC 62271-203	\N	\N	\N	f	\N	450000.00	\N	1	2026-09-02 02:58:03.254111+00	2026-09-02 02:58:03.254111+00	\N	\N	f	0
55555555-0002-0000-0000-000000000002	11111111-1111-1111-1111-111111111111	33333333-0001-0000-0000-000000000001	CT-220KV-OUT	\N	Máy biến dòng điện ngoài trời 220kV	\N	\N	Germany	6.00	Bộ	\N	\N	Tỷ số biến 2000-1000-500/1-1-1-1-1A, cấp chính xác 0.2S/5P20. Tiêu chuẩn IEC 61869-2	\N	\N	\N	f	\N	32000.00	\N	2	2026-09-02 02:58:03.254111+00	2026-09-02 02:58:03.254111+00	\N	\N	f	0
55555555-0003-0000-0000-000000000003	11111111-1111-1111-1111-111111111111	33333333-0001-0000-0000-000000000001	SA-220KV-ZNO	\N	Chống sét van không khe hở ZnO 220kV	\N	\N	Germany	6.00	Bộ	\N	\N	Điện áp định mức 198kV, dòng xả danh định 10kA, cấp phóng điện 4. Tiêu chuẩn IEC 60099-4	\N	\N	\N	f	\N	18500.00	\N	3	2026-09-02 02:58:03.254111+00	2026-09-02 02:58:03.254111+00	\N	\N	f	0
55555555-0004-0000-0000-000000000004	11111111-1111-1111-1111-111111111111	33333333-0001-0000-0000-000000000001	SR-220KV-50MVAR	\N	Cuộn kháng bù ngang 220kV - 50MVAR	\N	\N	Germany	1.00	Bộ	\N	\N	3 pha ngâm dầu ngoài trời, tổn hao thấp, phụ kiện giám sát online online bushing DGA. Tiêu chuẩn IEC 60076-6	\N	\N	\N	f	\N	850000.00	\N	4	2026-09-02 02:58:03.254111+00	2026-09-02 02:58:03.254111+00	\N	\N	f	0
\.


--
-- Data for Name: rfq_vendors; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.rfq_vendors (id, tenant_id, rfq_id, vendor_email, vendor_name, company_name, phone, country, category, status, invited_at, responded_at, decline_reason, notes, created_at, invitation_code, pin_hash, pin_salt, pin_attempts, pin_locked_until, created_by, updated_by, updated_at, is_deleted, version) FROM stdin;
44444444-0001-0000-0000-000000000001	11111111-1111-1111-1111-111111111111	33333333-0001-0000-0000-000000000001	bidding@siemens-energy.com	Mr. Klaus Weber	Siemens Energy AG	+49 89 63600	Germany	Manufacturer	AUTHENTICATED	2026-09-02 02:56:15.808068+00	2026-09-02 02:58:40.518679+00	\N	\N	2026-09-02 02:56:15.808068+00	RFQ-2026-MBA-SIEMENS	d79d3b6c37e23b72f3a388ca1b9cb82c31904d9656d498d51c8214e356983e36	s1eM3ns@2026	0	\N	\N	\N	2026-09-02 02:58:40.594305+00	f	3
dd4feaa0-9aa9-4882-9c70-b2b269a35f6a	11111111-1111-1111-1111-111111111111	97032935-4f30-44d2-bbe2-134714ae9c98	contact@vn.abb.com	Nguyễn Thanh Tùng	Công Ty TNHH ABB Power Grids Việt Nam	+84 24 3762 0100	Việt Nam	Tủ hợp bộ GIS & Biến dòng đo lường CT/VT	AUTHENTICATED	2026-09-02 06:03:22.497704+00	2026-09-02 06:03:31.925812+00	\N	\N	2026-09-02 06:03:22.519535+00	INV-27FEAB33	2b88a47013ab10b9a3123961000567d080634fb84709430a1f1d64514ff9d988	b2166a6f-f579-49	0	\N	\N	\N	2026-09-02 06:03:32.04757+00	f	1
90d14940-eed4-4cc3-8fdc-fc5b2da5247a	11111111-1111-1111-1111-111111111111	738f8289-f80a-4fde-a8e4-b7e0e5ef203f	contact@vn.abb.com	Nguyễn Thanh Tùng	Công Ty TNHH ABB Power Grids Việt Nam	+84 24 3762 0100	Việt Nam	Tủ hợp bộ GIS & Biến dòng đo lường CT/VT	INVITED	2026-09-02 06:11:03.697401+00	\N	\N	\N	2026-09-02 06:11:03.701025+00	INV-30E442FB	2f5e36c6ad6de13164b86cf5df40bb2ae0656c635b7af7e09bee04b7d69fec95	6acea90b-b1c3-48	0	\N	\N	\N	2026-09-02 06:11:03.701058+00	f	0
\.


--
-- Data for Name: rfqs; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.rfqs (id, tenant_id, project_id, rfq_code, title, description, incoterms, currency, payment_terms, shipping_method, deadline, required_delivery_date, quote_validity_days, delivery_port, delivery_address, origin_country, requires_sample, requires_factory_audit, special_requirements, budget_amount, evaluation_method, rfq_round, parent_rfq_id, status, published_at, closed_at, closed_reason, created_by, approved_by, created_at, updated_at, project_name, supplier_name, supplier_email, item_count, incoterm, total_quote_amount, submission_deadline, magic_link_expires_at, is_deleted, updated_by, version, code) FROM stdin;
33333333-0002-0000-0000-000000000002	11111111-1111-1111-1111-111111111111	11111111-0001-0000-0000-000000000001	RFQ-2026-ABB-02	Gói chào thầu Sứ xuyên RIP 220kV & Rơ le bảo vệ	\N	CIF	USD	\N	SEA	2026-09-13 16:23:20.717027+00	\N	30	\N	\N	\N	f	f	\N	\N	LOWEST_PRICE	1	\N	QUOTED	\N	\N	\N	11111111-1111-1111-1111-111111111101	\N	2026-09-01 16:23:20.717027+00	2026-09-01 16:23:20.717027+00	Dự án Cung cấp & Lắp đặt Máy Biến Áp 220kV - 250MVA	Hitachi Energy Ltd (Thụy Sĩ)	bids@hitachienergy.com	6	CIF	3620000.00	\N	\N	f	\N	0	RFQ-2026-ABB-02
33333333-0003-0000-0000-000000000003	11111111-1111-1111-1111-111111111111	11111111-0001-0000-0000-000000000001	RFQ-2026-TBEA-03	Gói chào thầu Lõi thép Silic định hướng & Dầu biến áp Nynas	\N	CIF	USD	\N	SEA	2026-09-16 16:23:20.717027+00	\N	30	\N	\N	\N	f	f	\N	\N	LOWEST_PRICE	1	\N	SENT	\N	\N	\N	11111111-1111-1111-1111-111111111101	\N	2026-09-01 16:23:20.717027+00	2026-09-01 16:23:20.717027+00	Dự án Cung cấp & Lắp đặt Máy Biến Áp 220kV - 250MVA	TBEA Shenyang Transformer Co., Ltd	overseas@tbea.com	6	CIF	3150000.00	\N	\N	f	\N	0	RFQ-2026-TBEA-03
33333333-0004-0000-0000-000000000004	11111111-1111-1111-1111-111111111111	11111111-0001-0000-0000-000000000001	RFQ-2026-HYOSUNG-04	Gói chào thầu Máy biến áp lực & Phụ kiện 220kV	\N	CIF	USD	\N	SEA	2026-09-15 16:23:20.717027+00	\N	30	\N	\N	\N	f	f	\N	\N	LOWEST_PRICE	1	\N	QUOTED	\N	\N	\N	11111111-1111-1111-1111-111111111101	\N	2026-09-01 16:23:20.717027+00	2026-09-01 16:23:20.717027+00	Dự án Cung cấp & Lắp đặt Máy Biến Áp 220kV - 250MVA	Hyosung Heavy Industries Corp	export@hyosung.com	6	CIF	3380000.00	\N	\N	f	\N	0	RFQ-2026-HYOSUNG-04
33333333-0001-0000-0000-000000000001	11111111-1111-1111-1111-111111111111	11111111-0001-0000-0000-000000000001	RFQ-2026-SIEMENS-01	Gói chào thầu thiết bị Cuộn kháng & Máy cắt 220kV	\N	CIF	EUR	\N	SEA	2026-09-11 16:23:20.717027+00	\N	30	\N	\N	\N	f	f	\N	\N	LOWEST_PRICE	1	\N	QUOTED	\N	\N	\N	11111111-1111-1111-1111-111111111101	\N	2026-09-01 16:23:20.717027+00	2026-09-02 03:00:06.247966+00	Dự án Cung cấp & Lắp đặt Máy Biến Áp 220kV - 250MVA	Siemens Energy AG (Đức)	tender@siemens-energy.de	6	CIF	482000.00	\N	\N	f	\N	1	RFQ-2026-SIEMENS-01
97032935-4f30-44d2-bbe2-134714ae9c98	11111111-1111-1111-1111-111111111111	11111111-0002-0000-0000-000000000002	RFQ-1788329002478	Gói thầu thiết bị điện ABB	\N	CIF	USD	\N	SEA	2026-09-09 06:03:22.490842+00	\N	30	\N	\N	\N	f	f	\N	\N	LOWEST_PRICE	1	\N	ISSUED	\N	\N	\N	\N	\N	2026-09-02 06:03:22.502847+00	2026-09-02 06:03:22.502964+00	Dự Án Nhà Máy Nhiệt Điện Nhơn Trạch 3 & 4 (PVN)	Công Ty TNHH ABB Power Grids Việt Nam	contact@vn.abb.com	5	CIF	\N	\N	\N	f	\N	0	RFQ-1788329002478
738f8289-f80a-4fde-a8e4-b7e0e5ef203f	11111111-1111-1111-1111-111111111111	11111111-0001-0000-0000-000000000001	RFQ-1788329463696	Gói thầu thiết bị máy biến áp 220kV ABB	\N	CIF	USD	\N	SEA	2026-09-09 06:11:03.696915+00	\N	30	\N	\N	\N	f	f	\N	\N	LOWEST_PRICE	1	\N	ISSUED	\N	\N	\N	\N	\N	2026-09-02 06:11:03.698241+00	2026-09-02 06:11:03.698277+00	Dự án Cung cấp & Lắp đặt Máy Biến Áp 220kV - 250MVA Trạm Biến Áp Đông Anh	Công Ty TNHH ABB Power Grids Việt Nam	contact@vn.abb.com	1	CIF	\N	\N	\N	f	\N	0	RFQ-1788329463696
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.role_permissions (role_id, feature_code) FROM stdin;
11111111-1111-1111-1111-111111111191	DASHBOARD:VIEW
11111111-1111-1111-1111-111111111191	PROJECT:VIEW
11111111-1111-1111-1111-111111111191	KANBAN:VIEW
11111111-1111-1111-1111-111111111191	WORKFLOW:VIEW
11111111-1111-1111-1111-111111111191	SOURCING:VIEW
11111111-1111-1111-1111-111111111191	MATRIX:VIEW
11111111-1111-1111-1111-111111111191	TASK:VIEW
11111111-1111-1111-1111-111111111191	LOGISTICS:VIEW
11111111-1111-1111-1111-111111111191	DMS:VIEW
11111111-1111-1111-1111-111111111191	ANALYTICS:VIEW
11111111-1111-1111-1111-111111111191	SYS:USER:VIEW
11111111-1111-1111-1111-111111111191	SYS:ROLE:VIEW
11111111-1111-1111-1111-111111111191	SYS:TENANT:VIEW
11111111-1111-1111-1111-111111111191	SYS:MENU:VIEW
11111111-1111-1111-1111-111111111191	SYS:SUBSCRIPTION:VIEW
11111111-1111-1111-1111-111111111191	SYS:INTEGRATION:VIEW
11111111-1111-1111-1111-111111111192	DASHBOARD:VIEW
11111111-1111-1111-1111-111111111192	SOURCING:VIEW
11111111-1111-1111-1111-111111111192	MATRIX:VIEW
11111111-1111-1111-1111-111111111192	LOGISTICS:VIEW
11111111-1111-1111-1111-111111111194	DASHBOARD:VIEW
11111111-1111-1111-1111-111111111194	PROJECT:VIEW
11111111-1111-1111-1111-111111111194	KANBAN:VIEW
11111111-1111-1111-1111-111111111194	WORKFLOW:VIEW
11111111-1111-1111-1111-111111111194	TASK:VIEW
11111111-1111-1111-1111-111111111191	COMMAND_CENTER:VIEW
11111111-1111-1111-1111-111111111192	COMMAND_CENTER:VIEW
11111111-1111-1111-1111-111111111193	COMMAND_CENTER:VIEW
11111111-1111-1111-1111-111111111194	COMMAND_CENTER:VIEW
11111111-1111-1111-1111-111111111195	COMMAND_CENTER:VIEW
11111111-1111-1111-1111-111111111192	WORKFLOW:VIEW
11111111-1111-1111-1111-111111111193	WORKFLOW:VIEW
11111111-1111-1111-1111-111111111195	WORKFLOW:VIEW
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.roles (id, tenant_id, name, description, is_system, created_at, updated_at) FROM stdin;
11111111-1111-1111-1111-111111111191	11111111-1111-1111-1111-111111111111	Super Admin	\N	t	2026-09-01 16:23:20.717027+00	2026-09-01 16:23:20.717027+00
11111111-1111-1111-1111-111111111192	11111111-1111-1111-1111-111111111111	Sourcing Manager	\N	f	2026-09-01 16:23:20.717027+00	2026-09-01 16:23:20.717027+00
11111111-1111-1111-1111-111111111193	11111111-1111-1111-1111-111111111111	Tenant Admin	Quản trị nội bộ doanh nghiệp, phân quyền và theo dõi gói cước	t	2026-09-02 04:46:22.933002+00	2026-09-02 04:46:22.933002+00
11111111-1111-1111-1111-111111111194	11111111-1111-1111-1111-111111111111	Bid Lead	Trưởng ban quản lý đấu thầu, phê duyệt hồ sơ và phân công nhiệm vụ	f	2026-09-02 04:46:22.933002+00	2026-09-02 04:46:22.933002+00
11111111-1111-1111-1111-111111111195	11111111-1111-1111-1111-111111111111	Logistics Coordinator	Điều phối vận đơn, quản lý Incoterms và thông quan hải quan	f	2026-09-02 04:46:22.933002+00	2026-09-02 04:46:22.933002+00
\.


--
-- Data for Name: saas_features; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.saas_features (code, module_code, name, description) FROM stdin;
SOURCING_BASE	SOURCING	Thu mua cơ bản	Tạo RFQ 1 vòng
SOURCING_PRO	SOURCING	Thu mua nâng cao	Đấu giá nhiều vòng (Multi-round)
LOGISTICS_BASE	LOGISTICS	Logistics cơ bản	Theo dõi vận đơn
LOGISTICS_COST	FINANCE	Phân tích Chi phí	Tính toán P&L cho từng Shipment
\.


--
-- Data for Name: saas_modules; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.saas_modules (code, name, description, is_active) FROM stdin;
SOURCING	Thu mua & Cung ứng	Quản lý RFQ, Vendor, Quotations	t
BIDDING	Đấu thầu	Quản lý dự án thầu, hồ sơ dự thầu	t
LOGISTICS	Vận hành Logistics	Quản lý vận tải, hải quan, lô hàng	t
FINANCE	Tài chính & Thanh toán	Quản lý thanh toán, P&L lô hàng	t
\.


--
-- Data for Name: shipment_costs; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.shipment_costs (id, tenant_id, shipment_id, cost_type, description, currency, amount, exchange_rate, amount_base, vendor_name, invoice_number, invoice_date, is_estimated, notes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: shipment_milestones; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.shipment_milestones (id, tenant_id, shipment_id, milestone_type, sequence, planned_date, revised_date, actual_date, is_completed, responsible_role, completed_by, delay_days, delay_reason, delay_category, evidence_urls, location, notes, updated_by, created_at, updated_at, code, name, status, seq_order, is_deleted, created_by, version) FROM stdin;
4a910709-cc9d-4c4c-af87-a5e2238929a0	11111111-1111-1111-1111-111111111111	77777777-0001-0000-0000-000000000001	ETD	1	2026-08-20	\N	2026-08-20	t	\N	\N	0	\N	\N	\N	Hamburg, Germany	\N	\N	2026-09-01 16:38:36.700291+00	2026-09-01 16:38:36.700291+00	M1_ETD	Rời cảng Hamburg (POL)	COMPLETED	1	f	\N	0
e6d3603d-b07a-4210-abc7-a2597eeb311f	11111111-1111-1111-1111-111111111111	77777777-0001-0000-0000-000000000001	IN_TRANSIT	2	2026-08-29	\N	2026-08-29	t	\N	\N	0	\N	\N	\N	Red Sea / Suez	\N	\N	2026-09-01 16:38:36.700291+00	2026-09-01 16:38:36.700291+00	M2_TRANSIT	Hành trình qua Kênh đào Suez	IN_PROGRESS	2	f	\N	0
94610319-c72f-4b51-b16d-8600898f172f	11111111-1111-1111-1111-111111111111	77777777-0001-0000-0000-000000000001	ETA	3	2026-09-17	\N	\N	f	\N	\N	\N	\N	\N	\N	Cảng Lạch Huyện, Hải Phòng	\N	\N	2026-09-01 16:38:36.700291+00	2026-09-01 16:38:36.700291+00	M3_ETA	Cập cảng Hải Phòng (POD)	PENDING	3	f	\N	0
e89371a5-f8ab-4fbc-9537-9ee95acb433f	11111111-1111-1111-1111-111111111111	77777777-0001-0000-0000-000000000001	CUSTOMS_CLEARANCE	4	2026-09-19	\N	\N	f	\N	\N	\N	\N	\N	\N	Hải quan KV3 Hải Phòng	\N	\N	2026-09-01 16:38:36.700291+00	2026-09-01 16:38:36.700291+00	M4_CUSTOMS	Thông quan tờ khai luồng Xanh	PENDING	4	f	\N	0
c3996514-9290-4ca5-b7cf-f100c4998fe8	11111111-1111-1111-1111-111111111111	77777777-0001-0000-0000-000000000001	DELIVERED	5	2026-09-26	\N	\N	f	\N	\N	\N	\N	\N	\N	TBA 500kV Tây Hà Nội	\N	\N	2026-09-01 16:38:36.700291+00	2026-09-01 16:38:36.700291+00	M5_DELIVERY	Bàn giao nghiệm thu tại TBA Tây Hà Nội	PENDING	5	f	\N	0
73ba0ef6-706a-44cf-a426-a60e274d5803	11111111-1111-1111-1111-111111111111	77777777-0002-0000-0000-000000000002	ETD	1	2026-08-27	\N	2026-08-27	t	\N	\N	0	\N	\N	\N	Kobe Port, Japan	\N	\N	2026-09-01 16:38:36.700291+00	2026-09-01 16:38:36.700291+00	M1_ETD	Rời cảng Kobe (POL)	COMPLETED	1	f	\N	0
13156a9c-8f89-4e14-9b6a-75d9633ed6e5	11111111-1111-1111-1111-111111111111	77777777-0002-0000-0000-000000000002	IN_TRANSIT	2	2026-09-01	\N	2026-09-01	t	\N	\N	0	\N	\N	\N	East Sea / South China Sea	\N	\N	2026-09-01 16:38:36.700291+00	2026-09-01 16:38:36.700291+00	M2_TRANSIT	Hành trình qua Biển Đông	IN_PROGRESS	2	f	\N	0
c8de4b9c-986b-4f09-8575-cb9a54a52213	11111111-1111-1111-1111-111111111111	77777777-0002-0000-0000-000000000002	ETA	3	2026-09-09	\N	\N	f	\N	\N	\N	\N	\N	\N	Cảng Quốc tế Cái Mép	\N	\N	2026-09-01 16:38:36.700291+00	2026-09-01 16:38:36.700291+00	M3_ETA	Cập cảng Cái Mép (POD)	PENDING	3	f	\N	0
066b69f8-addd-45db-9eec-5ea187d28653	11111111-1111-1111-1111-111111111111	77777777-0003-0000-0000-000000000003	ETD	1	2026-08-14	\N	2026-08-14	t	\N	\N	0	\N	\N	\N	Shanghai Port, China	\N	\N	2026-09-01 16:38:36.700291+00	2026-09-01 16:38:36.700291+00	M1_ETD	Rời cảng Thượng Hải (POL)	COMPLETED	1	f	\N	0
f56e103c-504d-4210-85ee-93313dd11748	11111111-1111-1111-1111-111111111111	77777777-0003-0000-0000-000000000003	ETA	3	2026-08-31	\N	2026-08-31	t	\N	\N	0	\N	\N	\N	Cảng Hải Phòng	\N	\N	2026-09-01 16:38:36.700291+00	2026-09-01 16:38:36.700291+00	M3_ETA	Cập cảng Hải Phòng (POD)	COMPLETED	3	f	\N	0
a84d7811-ea85-42df-9efb-69ecacf51397	11111111-1111-1111-1111-111111111111	77777777-0003-0000-0000-000000000003	CUSTOMS_CLEARANCE	4	2026-09-03	\N	\N	f	\N	\N	\N	\N	\N	\N	Chi cục HQ Đình Vũ	\N	\N	2026-09-01 16:38:36.700291+00	2026-09-01 16:38:36.700291+00	M4_CUSTOMS	Kiểm hóa luồng Vàng & Tham vấn giá	IN_PROGRESS	4	f	\N	0
64d86bab-ff60-432d-b417-c00754013658	11111111-1111-1111-1111-111111111111	77777777-0004-0000-0000-000000000004	ETD	1	2026-07-28	\N	2026-07-28	t	\N	\N	0	\N	\N	\N	Incheon, Korea	\N	\N	2026-09-01 16:38:36.700291+00	2026-09-01 16:38:36.700291+00	M1_ETD	Rời cảng Incheon (POL)	COMPLETED	1	f	\N	0
af5c81ce-981b-44cc-bc90-cd287ac77b72	11111111-1111-1111-1111-111111111111	77777777-0004-0000-0000-000000000004	ETA	3	2026-08-22	\N	2026-08-22	t	\N	\N	0	\N	\N	\N	Cảng Hải Phòng	\N	\N	2026-09-01 16:38:36.700291+00	2026-09-01 16:38:36.700291+00	M3_ETA	Cập cảng Hải Phòng (POD)	COMPLETED	3	f	\N	0
36ae9367-bd43-48e9-b0e8-1f5e348c3146	11111111-1111-1111-1111-111111111111	77777777-0004-0000-0000-000000000004	DELIVERED	5	2026-08-30	\N	2026-08-30	t	\N	\N	0	\N	\N	\N	Depot Nhổn Hà Nội	\N	\N	2026-09-01 16:38:36.700291+00	2026-09-01 16:38:36.700291+00	M5_DELIVERY	Bàn giao Depot Nhổn Metro Hà Nội	COMPLETED	5	f	\N	0
\.


--
-- Data for Name: shipments; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.shipments (id, tenant_id, project_id, shipment_code, bl_number, bl_type, booking_number, vessel_name, voyage_number, container_no, container_type, container_count, seal_number, shipping_method, origin_port, origin_country, destination_port, destination_country, transit_ports, cargo_description, total_packages, gross_weight_kg, net_weight_kg, total_cbm, hs_codes, forwarder_name, forwarder_contact, forwarder_email, shipping_line, insurance_provider, insurance_policy_no, insured_value, insurance_currency, customs_broker, customs_declaration_no, customs_cleared_at, status, assigned_to, notes, created_by, created_at, updated_at, project_name, contract_no, carrier, pol, pod, etd, eta, contract_deadline, equipment_summary, supplier_name, is_deleted, updated_by, version, customs_status, customs_cleared_date, in_transit_value_usd, in_transit_value_vnd, delay_reason, voyage_no) FROM stdin;
77777777-0001-0000-0000-000000000001	11111111-1111-1111-1111-111111111111	11111111-0001-0000-0000-000000000001	SHP-EEMC-2026-001	MAEU928374821	ORIGINAL	BKG-MAERSK-081	Maersk Mc-Kinney Moller	V.2608E	MSKU9021843	40HC	2	\N	SEA	\N	Đức	\N	Việt Nam	\N	Máy biến áp 220kV-250MVA và phụ kiện cuộn kháng điện	18	45200.000	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	USD	\N	\N	\N	IN_TRANSIT	\N	\N	11111111-1111-1111-1111-111111111101	2026-09-01 16:38:31.895249+00	2026-09-01 16:38:31.895249+00	Gói Thầu Mua Sắm & Lắp Đặt Máy Biến Áp 220kV TBA 500kV Tây Hà Nội (EVNNPT)	\N	Maersk Line	Cảng Hamburg (CHLB Đức)	Cảng Hải Phòng (Việt Nam)	2026-08-20	2026-09-17	2026-10-01	02 Máy biến áp lực 220kV, 06 Cuộn kháng bù ngang, 01 Bộ rơ le bảo vệ kỹ thuật số	Siemens Energy AG	f	\N	0	\N	\N	1450000.00	36902500000.00	\N	\N
77777777-0002-0000-0000-000000000002	11111111-1111-1111-1111-111111111111	11111111-0002-0000-0000-000000000002	SHP-PVN-2026-002	ONEY839201948	SEAWAY_BILL	BKG-ONE-092	ONE Apus	V.2610W	ONEY1829304	40HC	3	\N	SEA	\N	Nhật Bản	\N	Việt Nam	\N	Tủ điều khiển DCS Mark VIe và Modun giám sát rung động tuabin	24	32400.000	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	USD	\N	\N	\N	GATE_IN	\N	\N	11111111-1111-1111-1111-111111111101	2026-09-01 16:38:31.895249+00	2026-09-01 16:38:31.895249+00	Dự Án Mua Sắm Hệ Thống Điều Khiển DCS & Tuabin Khí Nhà Máy Điện Nhơn Trạch 3 & 4 (PVN)	\N	Ocean Network Express (ONE)	Cảng Kobe (Nhật Bản)	Cảng Cái Mép (Bà Rịa - Vũng Tàu)	2026-08-27	2026-09-09	2026-09-21	01 Hệ thống điều khiển phân tán DCS, 04 Cụm cảm biến rung tuabin khí, 12 Bộ biến dòng CT	Hitachi Energy Ltd	f	\N	0	\N	\N	2180000.00	55481000000.00	\N	\N
77777777-0003-0000-0000-000000000003	11111111-1111-1111-1111-111111111111	11111111-0003-0000-0000-000000000003	SHP-EVN-2026-003	EGLV192847291	TELEX_RELEASE	BKG-EVER-103	Ever Given	V.2612N	EGLU7382910	40HC	1	\N	SEA	\N	Trung Quốc	\N	Việt Nam	\N	Cuộn cáp ngầm cao thế 110kV XLPE và đầu cáp chuyên dụng	8	28500.000	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	USD	\N	\N	\N	CUSTOMS	\N	\N	11111111-1111-1111-1111-111111111101	2026-09-01 16:38:31.895249+00	2026-09-01 16:38:31.895249+00	Gói Thầu Cung Cấp Cáp Ngầm 110kV & Trạm Biến Áp Kỹ Thuật Số Thái Bình (EVNNPC)	\N	Evergreen Marine	Cảng Thượng Hải (Trung Quốc)	Cảng Hải Phòng (Việt Nam)	2026-08-14	2026-08-31	2026-09-11	15.000m Cáp ngầm XLPE 110kV, 18 Bộ đầu cáp ngoài trời, 06 Hộp nối cáp ngầm	TBEA Shenyang Transformer Co., Ltd	f	\N	0	\N	\N	850000.00	21632500000.00	\N	\N
77777777-0004-0000-0000-000000000004	11111111-1111-1111-1111-111111111111	11111111-0004-0000-0000-000000000004	SHP-METRO-2026-004	CMAC839281720	SURRENDERED	BKG-CMA-114	CMA CGM Jacques Saade	V.2615S	CMAU4829103	40HC	4	\N	SEA	\N	Hàn Quốc	\N	Việt Nam	\N	Hệ thống điều khiển chạy tàu tự động CBTC và trạm chỉnh lưu	36	68000.000	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	USD	\N	\N	\N	DELIVERED	\N	\N	11111111-1111-1111-1111-111111111101	2026-09-01 16:38:31.895249+00	2026-09-01 16:38:31.895249+00	Gói Thầu Hệ Thống Thông Tin Tín Hiệu & Cấp Điện Tuyến Metro Số 3 Hà Nội (MRB)	\N	CMA CGM	Cảng Incheon (Hàn Quốc)	Cảng Hải Phòng (Việt Nam)	2026-07-28	2026-08-22	2026-08-30	08 Bộ điều khiển ga trung tâm, 04 Trạm chỉnh lưu 1500V DC, 20 Bộ tín hiệu đường sắt LED	Hyosung Heavy Industries Corp	f	\N	0	\N	\N	3420000.00	87039000000.00	\N	\N
\.


--
-- Data for Name: stage_checklist_items; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.stage_checklist_items (id, tenant_id, stage_id, title, description, is_required, sort_order, created_at, doc_code, assignee_role, project_id, stage_code) FROM stdin;
7b0fe487-c2fe-4720-bcee-72a6f91d6783	11111111-1111-1111-1111-111111111111	\N	Phân tích HSMT Máy biến áp 220kV & Tiêu chuẩn IEC 60076	Đánh giá yêu cầu tổn hao không tải Po, tổn hao có tải Pk và mức độ chịu ngắn mạch đột ngột	t	1	2026-09-02 05:24:32.414624+00	EEMC-HSMT-220KV	Kỹ sư Trưởng Thiết kế	11111111-0001-0000-0000-000000000001	STAGE_PREPARATION
8c30c7a5-e03b-4416-ad82-5c822ae98a51	11111111-1111-1111-1111-111111111111	\N	Biên bản khảo sát mặt bằng trạm 220kV Đông Anh & Đường vận chuyển	Khảo sát tĩnh không cầu đường, tải trọng cầu trục bốc dỡ ruột máy biến áp 250 MVA	t	2	2026-09-02 05:24:32.414624+00	EEMC-SITE-SURVEY	Chuyên viên Hiện trường	11111111-0001-0000-0000-000000000001	STAGE_PREPARATION
454292b1-6476-4646-ab9c-83c9305f0132	11111111-1111-1111-1111-111111111111	\N	Nghị quyết HĐQT phê duyệt liên danh dự thầu thiết bị trạm 220kV	Ủy quyền ký hồ sơ dự thầu và cam kết nguồn vốn lưu động thực hiện	t	3	2026-09-02 05:24:32.414624+00	EEMC-BID-APPROVAL	Hội đồng Quản trị	11111111-0001-0000-0000-000000000001	STAGE_PREPARATION
659e16fb-787b-4ea5-81c9-04539b94c25a	11111111-1111-1111-1111-111111111111	\N	Bóc tách BoQ Tôn Silic đẳng hướng & Đồng thanh dẫn OFHC	Quy cách thép kỹ thuật điện cán lạnh 0.23mm và đồng điện phân có độ dẫn điện >101% IACS	t	1	2026-09-02 05:24:32.417644+00	EEMC-BOM-COPPER	Trưởng phòng Cung ứng	11111111-0001-0000-0000-000000000001	STAGE_SOURCING
b0de6463-74fe-4009-a113-4e75d88349ed	11111111-1111-1111-1111-111111111111	\N	Chào giá bộ Sứ xuyên cách điện 220kV RIP & Bộ đổi nấc OLTC	Yêu cầu báo giá từ 3 hãng xuất xứ G7 (ABB/Hitachi, Reinhausen MR Đức)	t	2	2026-09-02 05:24:32.417644+00	EEMC-RFQ-BUSHING	Chuyên viên Mua sắm Quốc tế	11111111-0001-0000-0000-000000000001	STAGE_SOURCING
d6bb0a3c-18bc-4ff3-b1bb-4c485e0023d9	11111111-1111-1111-1111-111111111111	\N	Kiểm tra chứng chỉ chất lượng Dầu cách điện Naphthenic gốc khoáng	Thử nghiệm độ xuyên kim, điện áp đánh thủng >70kV và hàm lượng ẩm <10ppm	t	3	2026-09-02 05:24:32.417644+00	EEMC-OIL-SPEC	Kỹ sư Thí nghiệm Hóa dầu	11111111-0001-0000-0000-000000000001	STAGE_SOURCING
d69893d2-c3c2-4792-a3f9-e3d221b4c2be	11111111-1111-1111-1111-111111111111	\N	Quy trình thử nghiệm xuất xưởng FAT theo tiêu chuẩn KEMA	Biên soạn kịch bản đo độ tăng nhiệt cuộn dây, thử nghiệm xung sét 1050kV	t	1	2026-09-02 05:24:32.419068+00	EEMC-FAT-PROC	Trưởng phòng Quản lý Chất lượng	11111111-0001-0000-0000-000000000001	STAGE_DOSSIER_PREP
8d5ff621-830e-4344-9a06-8601fb48a6a3	11111111-1111-1111-1111-111111111111	\N	Thư bảo lãnh dự thầu ngân hàng BIDV trị giá 5 tỷ VNĐ	Bảo lãnh vô điều kiện, không hủy ngang, hiệu lực 180 ngày kể từ ngày đóng thầu	t	2	2026-09-02 05:24:32.419068+00	EEMC-BG-BIDV	Kế toán Trưởng	11111111-0001-0000-0000-000000000001	STAGE_DOSSIER_PREP
c2a68c88-90c8-42ef-8c8e-489ce988a870	11111111-1111-1111-1111-111111111111	\N	Thẩm tra Hồ sơ mời thầu EPC Quốc tế Fidic Silver Book	Kiểm tra điều khoản chia sẻ rủi ro địa chất, thuế nhập khẩu và bảo hiểm công trình	t	1	2026-09-02 05:24:32.420131+00	PVN-HSMT-EPC	Ban Pháp chế Tập đoàn	11111111-0002-0000-0000-000000000002	STAGE_PREPARATION
ed7fd8f4-d2df-4116-9ffa-1b4350745d98	11111111-1111-1111-1111-111111111111	\N	Đánh giá năng lực chế tạo lò hơi thu hồi nhiệt HRSG theo chuẩn ASME	Kiểm tra chứng nhận ASME Section I, dấu U-Stamp của nhà thầu phụ chế tạo ống áp lực	t	2	2026-09-02 05:24:32.420131+00	PVN-ASME-HRSG	Chuyên gia Nhiệt điện	11111111-0002-0000-0000-000000000002	STAGE_PREPARATION
221fef3b-2c2b-4080-9b48-5fa5001a8154	11111111-1111-1111-1111-111111111111	\N	Hồ sơ kỹ thuật Tua bin khí chu trình hỗn hợp H-Class 9HA.02	Đàm phán cam kết hiệu suất nhiệt >62% và nồng độ phát thải NOx <15 ppm với GE/Siemens	t	1	2026-09-02 05:24:32.420131+00	PVN-RFQ-TURBINE	Giám đốc Dự án EPC	11111111-0002-0000-0000-000000000002	STAGE_SOURCING
c6d61eda-f4a0-463b-86d6-7b8961c8d6fa	11111111-1111-1111-1111-111111111111	\N	Kế hoạch thu xếp Bảo hiểm mọi rủi ro xây dựng lắp đặt (CAR/EAR)	Bảo hiểm tổn thất tài sản và trách nhiệm đối với bên thứ ba hạn mức 500 triệu USD	t	2	2026-09-02 05:24:32.420131+00	PVN-CAR-INSURANCE	Trưởng ban Tài chính Dự án	11111111-0002-0000-0000-000000000002	STAGE_SOURCING
b34851db-0488-4ba4-963c-4b9518eaa60e	11111111-1111-1111-1111-111111111111	\N	Đặc tính kỹ thuật Cáp ngầm cách điện XLPE 110kV chống thấm nước	Tiêu chuẩn IEC 60840, hàm lượng muội than vỏ bọc HDPE và khả năng chịu dòng ngắn mạch	t	1	2026-09-02 05:24:32.421265+00	EVN-SPEC-CABLE	Kỹ sư Hệ thống Cáp	11111111-0003-0000-0000-000000000003	STAGE_PREPARATION
ed160882-515b-40c5-a36a-f7a8ad882f32	11111111-1111-1111-1111-111111111111	\N	Đo đạc điện trở suất của đất & Thiết kế tiếp địa chống sét van 110kV	Báo cáo đo đạc tại 15 điểm rải cáp ngầm đảm bảo điện trở nối đất <0.5 Ohm	t	2	2026-09-02 05:24:32.421265+00	EVN-SOIL-RESIST	Tổ đo kiểm An toàn	11111111-0003-0000-0000-000000000003	STAGE_PREPARATION
3973815b-9f21-4d0c-bc0c-1fb25e9a87e6	11111111-1111-1111-1111-111111111111	\N	Thẩm định báo giá 3 hãng cáp ngầm quốc tế (LS Cable, Prysmian, Furukawa)	Đối soát chi phí CIF Hải Phòng kèm bảo hành tuổi thọ vận hành 30 năm	t	1	2026-09-02 05:24:32.421265+00	EVN-RFQ-LS-PRYSMIAN	Phòng Đấu thầu EVN	11111111-0003-0000-0000-000000000003	STAGE_SOURCING
7ac053c3-181c-427c-8a16-dce39759aacc	11111111-1111-1111-1111-111111111111	\N	Chứng chỉ an toàn toàn vẹn hệ thống đường sắt RAMS EN 50126 (SIL-4)	Yêu cầu hệ thống điều khiển đoàn tàu tự động CBTC đạt mức độ an toàn SIL-4 từ cơ quan TÜV	t	1	2026-09-02 05:24:32.422211+00	METRO-RAMS-EN50126	Chuyên gia Tín hiệu Đường sắt	11111111-0004-0000-0000-000000000004	STAGE_PREPARATION
adb0805e-d1fc-4c1b-8746-6a874dcbda0f	11111111-1111-1111-1111-111111111111	\N	Kế hoạch thử nghiệm tương thích điện từ trường EMC dọc tuyến đường ray	Chứng nhận không gây can nhiễu tín hiệu thông tin vô tuyến LTE-R và mạng viễn thông công cộng	t	2	2026-09-02 05:24:32.422211+00	METRO-EMC-COMPLIANCE	Kỹ sư Viễn thông	11111111-0004-0000-0000-000000000004	STAGE_PREPARATION
60cd02c7-f975-41c9-91c4-ca4bc1087234	11111111-1111-1111-1111-111111111111	\N	Chào giá gói thiết bị điều khiển tự động lắp đặt trên đoàn tàu (On-board ATO/ATP)	Yêu cầu tương thích với hệ thống tín hiệu của Alstom/Siemens Mobility	t	1	2026-09-02 05:24:32.422211+00	METRO-RFQ-ONBOARD-ATO	Ban Quản lý Dự án Metro	11111111-0004-0000-0000-000000000004	STAGE_SOURCING
\.


--
-- Data for Name: stage_doc_rules; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.stage_doc_rules (id, tenant_id, stage_id, doc_type_id, requires_approval, is_hard_stop, min_version, max_age_days, description, created_at) FROM stdin;
\.


--
-- Data for Name: stage_notifications; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.stage_notifications (id, tenant_id, stage_id, event_type, target_role, channel, subject_template, body_template, delay_minutes, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: subscription_invoices; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.subscription_invoices (id, tenant_id, subscription_id, invoice_number, amount, currency, status, payment_method, payment_date, due_date, transaction_reference, notes, created_at, updated_at, tenant_code) FROM stdin;
INV-2026-001	11111111-1111-1111-1111-111111111111	SUB-EEMC-2026	INV-EEMC-2026-01	80000000.00	VND	PAID	BANK_TRANSFER	2026-01-02 02:30:00+00	2026-01-15	TXN-VCB-883921	\N	2026-09-02 04:23:18.298267+00	2026-09-02 04:23:18.298267+00	EEMC
INV-2026-002	22222222-2222-2222-2222-222222222222	SUB-PVN-2026	INV-PVN-2026-01	200000000.00	VND	PAID	BANK_TRANSFER	2026-01-03 07:15:00+00	2026-01-20	TXN-BIDV-991283	\N	2026-09-02 04:23:18.298267+00	2026-09-02 04:23:18.298267+00	PVN
\.


--
-- Data for Name: subscription_notifications; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.subscription_notifications (id, tenant_id, subscription_id, notification_type, recipient_email, title, message, days_remaining, sent_at, status, tenant_code) FROM stdin;
NOTIF-001	11111111-1111-1111-1111-111111111111	SUB-EEMC-2026	RENEWAL_CONFIRMATION	contact@eemc.com.vn	Gia hạn dịch vụ MIBID thành công	Hợp đồng thuê bao gói Professional Bid đã được kích hoạt đến 31/12/2026	120	2026-09-02 04:23:18.299931+00	SENT	EEMC
NOTIF-002	22222222-2222-2222-2222-222222222222	SUB-PVN-2026	RENEWAL_CONFIRMATION	bidding@pvn.vn	Kích hoạt gói dịch vụ Enterprise	Chào mừng PVN sử dụng gói Enterprise XNK không giới hạn của MIBID	120	2026-09-02 04:23:18.299931+00	SENT	PVN
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.subscription_plans (id, name, max_users, max_storage_gb, price, currency, is_active, code, monthly_price, yearly_price, max_machines, allowed_modules, created_at, updated_at, description) FROM stdin;
PLAN-STARTER	Gói Khởi Động Đấu Thầu (Starter)	5	50	0.00	USD	t	STARTER	3000000.00	30000000.00	0	["CORE", "BIDDING", "SOURCING"]	2026-09-02 04:08:27.010873+00	2026-09-02 04:58:44.413637+00	Dành cho doanh nghiệp vừa và nhỏ tham gia dưới 10 gói thầu/năm
PLAN-PRO	Gói Chuyên Nghiệp (Professional Bid)	10	100	0.00	USD	t	PROFESSIONAL	8000000.00	80000000.00	0	["CORE", "BIDDING", "SOURCING", "LOGISTICS", "DMS", "ANALYTICS"]	2026-09-02 04:08:27.010873+00	2026-09-02 04:58:52.941918+00	Đầy đủ tính năng phân tích HSMT, Sourcing đa tiền tệ và kho tài liệu DMS
PLAN-ENTERPRISE	Gói Doanh Nghiệp Cao Cấp (Enterprise XNK)	50	2000	0.00	USD	t	ENTERPRISE	20000000.00	200000000.00	0	["CORE", "BIDDING", "SOURCING", "LOGISTICS", "DMS", "ANALYTICS", "SYSTEM_ADMIN", "SAAS_BILLING"]	2026-09-02 04:08:27.010873+00	2026-09-02 04:59:05.189198+00	Không giới hạn dung lượng, tích hợp Hải quan / ERP, bảo mật cấp độ cao và SLA 99.99%
\.


--
-- Data for Name: supplier_partners; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.supplier_partners (id, tenant_id, code, name, tax_code, country, category, rating, contact_person, email, phone, status, total_quotes_submitted, total_won_bids, iso_certified, is_deleted, version, created_by, updated_by, created_at, updated_at) FROM stdin;
44444444-0001-0000-0000-000000000001	11111111-1111-1111-1111-111111111111	PART-1001	Siemens Energy AG	DE129274202	Đức	Cuộn kháng & Máy cắt cao thế 220kV	4.9	Marcus Mueller	tender@siemens-energy.de	+49 89 636 00	ACTIVE	14	8	t	f	0	\N	\N	2026-09-01 16:34:25.282411+00	2026-09-01 16:34:25.282411+00
44444444-0002-0000-0000-000000000002	11111111-1111-1111-1111-111111111111	PART-1002	Hitachi Energy Ltd	CHE101538058	Thụy Sĩ	Sứ xuyên RIP 220kV & Rơ le bảo vệ	4.8	Elena Rossi	bids@hitachienergy.com	+41 43 317 7111	ACTIVE	18	11	t	f	0	\N	\N	2026-09-01 16:34:25.282411+00	2026-09-01 16:34:25.282411+00
44444444-0003-0000-0000-000000000003	11111111-1111-1111-1111-111111111111	PART-1003	TBEA Shenyang Transformer Co., Ltd	91210100241289136P	Trung Quốc	Lõi thép Silic định hướng & Dầu biến áp Nynas	4.7	Zhang Wei	overseas@tbea.com	+86 24 2582 8888	ACTIVE	22	12	t	f	0	\N	\N	2026-09-01 16:34:25.282411+00	2026-09-01 16:34:25.282411+00
44444444-0004-0000-0000-000000000004	11111111-1111-1111-1111-111111111111	PART-1004	Hyosung Heavy Industries Corp	101-81-37466	Hàn Quốc	Máy biến áp lực & Phụ kiện 220kV	4.8	Kim Min-jun	export@hyosung.com	+82 2 707 7000	ACTIVE	10	5	t	f	0	\N	\N	2026-09-01 16:34:25.282411+00	2026-09-01 16:34:25.282411+00
44444444-0005-0000-0000-000000000005	11111111-1111-1111-1111-111111111111	PART-1005	Công Ty TNHH ABB Power Grids Việt Nam	0100109605	Việt Nam	Tủ hợp bộ GIS & Biến dòng đo lường CT/VT	4.9	Nguyễn Thanh Tùng	contact@vn.abb.com	+84 24 3762 0100	ACTIVE	15	9	t	f	0	\N	\N	2026-09-01 16:34:25.282411+00	2026-09-01 16:34:25.282411+00
\.


--
-- Data for Name: system_config; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.system_config (config_key, config_value, description, data_type, is_active, updated_at) FROM stdin;
subscription.default.plan.code	ENTERPRISE	Mã gói cước dịch vụ mặc định	STRING	t	2026-09-02 03:55:51.172544+00
subscription.default.billing.cycle	YEARLY	Chu kỳ thanh toán mặc định (MONTHLY, QUARTERLY, YEARLY)	STRING	t	2026-09-02 03:55:51.172544+00
subscription.default.grace.period.days	7	Số ngày ân hạn mặc định sau khi hết hạn thuê bao	INTEGER	t	2026-09-02 03:55:51.172544+00
subscription.invoice.due.days	15	Số ngày đến hạn thanh toán hóa đơn gia hạn	INTEGER	t	2026-09-02 03:55:51.172544+00
subscription.default.currency	VND	Đơn vị tiền tệ hạch toán thuê bao mặc định	STRING	t	2026-09-02 03:55:51.172544+00
subscription.default.payment.method	BANK_TRANSFER	Phương thức thanh toán mặc định	STRING	t	2026-09-02 03:55:51.172544+00
subscription.notification.renewal.title	Gia hạn dịch vụ MIBID thành công	Tiêu đề thông báo gia hạn thuê bao	STRING	t	2026-09-02 03:55:51.172544+00
subscription.notification.renewal.message	Hợp đồng thuê bao gói {planName} đã được gia hạn đến ngày {endDate}	Mẫu nội dung thông báo gia hạn thuê bao	STRING	t	2026-09-02 03:55:51.172544+00
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.system_settings (id, tenant_id, setting_key, setting_value, value_type, category, description, is_public, updated_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.tasks (id, tenant_id, project_id, project_name, stage_id, code, title, department_code, priority, assignee_id, assignee_name, assignee_avatar, due_at, is_mandatory, status, clarification_count, sla_status, sla_remaining_hours, created_at, updated_at, created_by, updated_by, is_deleted, version, completed_at, evidence_docs, gate_checklists) FROM stdin;
22222222-0002-0000-0000-000000000002	11111111-1111-1111-1111-111111111111	11111111-0001-0000-0000-000000000001	Dự án Cung cấp & Lắp đặt Máy Biến Áp 220kV - 250MVA	\N	DA-2026-EEMC-220KV	Tổng hợp bảng so sánh Landed Cost đa ngoại tệ USD/EUR/VND	COMMERCIAL	URGENT	\N	Trần Thị Thu Thảo	\N	2026-09-03 16:23:20.717027+00	t	IN_PROGRESS	0	ON_TRACK	24	2026-09-01 16:23:20.717027+00	2026-09-01 16:23:20.717027+00	\N	\N	f	0	\N	[{"id": "doc-eemc-3", "name": "Bảng tổng hợp báo giá từ 3 nhà cung cấp quốc tế (ABB, MR, Siemens)", "docCode": "QUOTATION_SUMMARY_2026.xlsx", "isUploaded": true, "uploadedAt": "2026-08-29T09:00:00Z", "uploadedBy": "Trần Thị Mai"}, {"id": "doc-eemc-4", "name": "Bảng tính Landed Cost gồm thuế nhập khẩu, cước tàu và chi phí bảo hiểm", "docCode": "LANDED_COST_CALC.xlsx", "isUploaded": false}]	[{"id": "chk-eemc-3", "title": "Tỷ giá quy đổi ngoại tệ USD/EUR đối soát theo ngân hàng VCB ngày làm việc", "isPassed": true}, {"id": "chk-eemc-4", "title": "Chi phí Landed Cost không vượt định mức dự toán được duyệt", "isPassed": false}]
22222222-0003-0000-0000-000000000003	11111111-1111-1111-1111-111111111111	11111111-0001-0000-0000-000000000001	Dự án Cung cấp & Lắp đặt Máy Biến Áp 220kV - 250MVA	\N	DA-2026-EEMC-220KV	Phát hành Thư bảo lãnh dự thầu Swift MT760 từ BIDV/Vietinbank	FINANCE	HIGH	\N	Hoàng Minh Đức	\N	2026-09-06 16:23:20.717027+00	t	TODO	0	ON_TRACK	72	2026-09-01 16:23:20.717027+00	2026-09-01 16:23:20.717027+00	\N	\N	f	0	\N	[{"id": "doc-eemc-5", "name": "Đơn đề nghị cấp Thư bảo lãnh dự thầu gửi Ngân hàng BIDV", "docCode": "BIDV_GUARANTEE_REQ.docx", "isUploaded": false}, {"id": "doc-eemc-6", "name": "Bản sao điện tín Swift MT760 phát hành bảo lãnh", "docCode": "SWIFT_MT760_COPY.pdf", "isUploaded": false}]	[{"id": "chk-eemc-5", "title": "Giá trị bảo lãnh tối thiểu 5.000.000.000 VNĐ theo đúng quy định HSMT", "isPassed": false}, {"id": "chk-eemc-6", "title": "Thời hạn hiệu lực bảo lãnh tối thiểu 180 ngày kể từ ngày đóng thầu", "isPassed": false}, {"id": "chk-eemc-7", "title": "Đã có cam kết cấp tín dụng của Ngân hàng thương mại", "isPassed": false}]
22222222-0004-0000-0000-000000000004	11111111-1111-1111-1111-111111111111	11111111-0001-0000-0000-000000000001	Dự án Cung cấp & Lắp đặt Máy Biến Áp 220kV - 250MVA	\N	DA-2026-EEMC-220KV	Rà soát điều khoản trách nhiệm pháp lý Incoterms 2020 CIF Hải Phòng	LEGAL	MEDIUM	\N	Vũ Mai Phương	\N	2026-09-07 16:23:20.717027+00	t	DONE	0	ON_TRACK	96	2026-09-01 16:23:20.717027+00	2026-09-01 16:23:20.717027+00	\N	\N	f	0	\N	[{"id": "doc-eemc-7", "name": "Báo cáo rà soát rủi ro hợp đồng mẫu và Incoterms 2020", "docCode": "LEGAL_REVIEW_REPORT.pdf", "isUploaded": true, "uploadedAt": "2026-08-30T16:00:00Z", "uploadedBy": "Phạm Quốc Tuấn"}, {"id": "doc-eemc-8", "name": "Ý kiến pháp lý về điều khoản giải quyết tranh chấp trọng tài VIAC", "docCode": "LEGAL_OPINION_ARBITRATION.pdf", "isUploaded": true, "uploadedAt": "2026-08-30T17:00:00Z", "uploadedBy": "Phạm Quốc Tuấn"}]	[{"id": "chk-eemc-8", "title": "Điều khoản phạt chậm giao hàng không vượt quá 8% giá trị hợp đồng", "isPassed": true}, {"id": "chk-eemc-9", "title": "Luật áp dụng là Luật pháp nước Cộng hòa Xã hội Chủ nghĩa Việt Nam", "isPassed": true}]
22222222-0001-0000-0000-000000000001	11111111-1111-1111-1111-111111111111	11111111-0001-0000-0000-000000000001	Dự án Cung cấp & Lắp đặt Máy Biến Áp 220kV - 250MVA	\N	DA-2026-EEMC-220KV	Phân tích chi tiết đặc tính kỹ thuật MBA 220kV theo HSMT	TECHNICAL	HIGH	\N	Nguyễn Văn Hùng	\N	2026-09-05 16:23:20.717027+00	t	DONE	0	ON_TRACK	48	2026-09-01 16:23:20.717027+00	2026-09-01 16:23:20.717027+00	\N	\N	f	0	\N	[{"id": "doc-eemc-1", "name": "Báo cáo phân tích đặc tính kỹ thuật MBA 220kV IEC 60076", "docCode": "TECH_ANALYSIS_220KV.pdf", "isUploaded": true, "uploadedAt": "2026-08-28T10:00:00Z", "uploadedBy": "Nguyễn Văn Hùng"}, {"id": "doc-eemc-2", "name": "Biên bản tính toán ngắn mạch và khả năng chịu dòng sự cố", "docCode": "SHORT_CIRCUIT_CALC.xlsx", "isUploaded": true, "uploadedAt": "2026-08-28T14:30:00Z", "uploadedBy": "Nguyễn Văn Hùng"}]	[{"id": "chk-eemc-1", "title": "Đạt thử nghiệm mô phỏng độ tăng nhiệt cuộn dây < 65K", "isPassed": true}, {"id": "chk-eemc-2", "title": "Đã có xác nhận thẩm định của Kỹ sư Trưởng Thiết kế", "isPassed": true}]
4e7e67ac-e20c-419c-bd9e-4f2f5254fea9	11111111-1111-1111-1111-111111111111	11111111-0002-0000-0000-000000000002	Gói thầu EPC Quốc tế Thiết bị Cơ Điện Nhà máy Điện Nhơn Trạch 3 & 4	\N	DA-2026-PVN-NT34	Thẩm tra chứng chỉ ASME và năng lực chế tạo lò hơi thu hồi nhiệt HRSG	TECHNICAL	URGENT	\N	Lê Hoàng Nam	\N	2026-09-07 05:28:36.723112+00	f	IN_PROGRESS	0	ON_TRACK	24	2026-09-02 05:28:36.723112+00	2026-09-02 05:28:36.723112+00	\N	\N	f	0	\N	[{"id": "doc-pvn-1", "name": "Chứng chỉ ASME Section I và dấu U-Stamp nhà thầu", "docCode": "ASME_U_STAMP_CERT.pdf", "isUploaded": true, "uploadedAt": "2026-08-31T11:00:00Z"}, {"id": "doc-pvn-2", "name": "Hồ sơ kiểm tra không phá hủy NDT đường hàn ống áp lực", "docCode": "NDT_REPORT_HRSG.pdf", "isUploaded": false}]	[{"id": "chk-pvn-1", "title": "Đạt 100% kiểm tra siêu âm UT và chụp phim RT mối hàn áp lực cao", "isPassed": false}, {"id": "chk-pvn-2", "title": "Có biên bản chứng kiến nghiệm thu của Tư vấn giám sát quốc tế", "isPassed": false}]
8aa66861-2b1f-4200-a5de-efb54a8f7047	11111111-1111-1111-1111-111111111111	11111111-0003-0000-0000-000000000003	Gói thầu Mua sắm Sứ Xuyên & Cáp Ngầm Trung Thế 110kV Miền Bắc	\N	DA-2026-EVN-TB	Đo kiểm điện trở suất đất và thiết kế bãi tiếp địa chống sét trạm 110kV	TECHNICAL	HIGH	\N	Bùi Văn Hạnh	\N	2026-09-05 05:28:36.723112+00	f	IN_PROGRESS	0	ON_TRACK	24	2026-09-02 05:28:36.723112+00	2026-09-02 05:28:36.723112+00	\N	\N	f	0	\N	[{"id": "doc-evn-1", "name": "Báo cáo kết quả đo điện trở suất đất tại 15 vị trí", "docCode": "SOIL_RESISTIVITY_REPORT.pdf", "isUploaded": true, "uploadedAt": "2026-09-01T08:30:00Z"}, {"id": "doc-evn-2", "name": "Bản vẽ thiết kế bãi cọc tiếp địa đồng bọc thép", "docCode": "GROUNDING_GRID_DWG.dwg", "isUploaded": false}]	[{"id": "chk-evn-1", "title": "Điện trở tiếp địa đo thực tế nhỏ hơn 0.5 Ohm trong mùa khô", "isPassed": false}, {"id": "chk-evn-2", "title": "Có biên bản thỏa thuận đấu nối với Công ty Điện lực địa phương", "isPassed": true}]
aa589122-9c47-4d37-ad40-3c3eec531f29	11111111-1111-1111-1111-111111111111	11111111-0004-0000-0000-000000000004	Gói thầu Thiết bị Thông tin Tín hiệu Tuyến Metro Số 3 Hà Nội	\N	DA-2026-HANOI-METRO	Đánh giá an toàn toàn vẹn hệ thống đường sắt RAMS cấp độ SIL-4 (EN 50126)	TECHNICAL	URGENT	\N	Vũ Minh Đức	\N	2026-09-09 05:28:36.723112+00	f	TODO	0	ON_TRACK	24	2026-09-02 05:28:36.723112+00	2026-09-02 05:28:36.723112+00	\N	\N	f	0	\N	[{"id": "doc-metro-1", "name": "Chứng thư an toàn SIL-4 cấp bởi TÜV Rheinland", "docCode": "TUV_SIL4_CERTIFICATE.pdf", "isUploaded": false}, {"id": "doc-metro-2", "name": "Báo cáo đánh giá rủi ro an toàn độc lập ISA Report", "docCode": "ISA_SAFETY_AUDIT.pdf", "isUploaded": false}]	[{"id": "chk-metro-1", "title": "Tỷ lệ hư hỏng nguy hiểm phát sinh dưới 10^-9 giờ vận hành (MTTFD)", "isPassed": false}, {"id": "chk-metro-2", "title": "Bộ điều khiển ATO tự động dừng tàu chuẩn xác trong phạm vi +/- 30cm", "isPassed": false}]
\.


--
-- Data for Name: tenant_menu_permissions; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.tenant_menu_permissions (id, tenant_id, menu_id, menu_code, menu_name, route_path, module_code, is_enabled, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tenant_subscriptions; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.tenant_subscriptions (id, tenant_id, plan_id, start_date, end_date, status, created_at, updated_at, billing_cycle, grace_period_days, auto_renew, current_user_count, current_machine_count, last_notification_sent_at) FROM stdin;
SUB-EEMC-2026	11111111-1111-1111-1111-111111111111	PLAN-PRO	2026-01-01	2026-12-31	ACTIVE	2026-09-02 04:23:18.295324+00	2026-09-02 04:23:18.295324+00	YEARLY	7	t	15	0	\N
SUB-PVN-2026	22222222-2222-2222-2222-222222222222	PLAN-ENTERPRISE	2026-01-01	2026-12-31	ACTIVE	2026-09-02 04:23:18.295324+00	2026-09-02 04:23:18.295324+00	YEARLY	14	t	85	0	\N
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.tenants (id, name, domain, status, created_at, updated_at, code, tax_code, contact_email, contact_phone, storage_quota_gb, is_deleted, version, created_by, updated_by, tenant_id) FROM stdin;
11111111-1111-1111-1111-111111111111	Tổng Công Ty Thiết Bị Điện Đông Anh (EEMC)	eemc.mibid.vn	ACTIVE	2026-09-01 16:21:57.070486+00	2026-09-01 16:21:57.070486+00	EEMC	\N	contact@mibid.vn	\N	50	f	0	\N	\N	\N
22222222-2222-2222-2222-222222222222	Tập đoàn Dầu Khí Quốc Gia Việt Nam (PVN)	pvn.mibid.vn	ACTIVE	2026-09-01 16:21:57.070486+00	2026-09-01 16:21:57.070486+00	PVN	\N	contact@mibid.vn	\N	50	f	0	\N	\N	\N
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.user_sessions (id, tenant_id, user_id, session_token, refresh_token, device_info, ip_address, is_active, expires_at, last_activity_at, revoked_at, revoked_reason, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.users (id, tenant_id, email, password_hash, full_name, phone, avatar_url, department, "position", employee_code, direct_manager_id, role_id, is_active, is_2fa_enabled, two_fa_secret, password_changed_at, failed_login_count, locked_until, last_login_at, last_login_ip, locale, timezone, email_notifications, created_at, updated_at, username, role, status, is_deleted, version, created_by, updated_by) FROM stdin;
11111111-1111-1111-1111-111111111101	11111111-1111-1111-1111-111111111111	admin@eemc.mibid.vn	a	Nguyễn Văn Hùng (Bid Lead)	\N	\N	\N	\N	\N	\N	11111111-1111-1111-1111-111111111191	t	f	\N	\N	0	\N	\N	\N	vi	Asia/Ho_Chi_Minh	t	2026-09-01 16:23:20.717027+00	2026-09-01 16:23:20.717027+00	\N	ADMIN	ACTIVE	f	0	\N	\N
11111111-1111-1111-1111-111111111102	11111111-1111-1111-1111-111111111111	sourcing@eemc.mibid.vn	a	Trần Thị Thu Thảo (Sourcing Lead)	\N	\N	\N	\N	\N	\N	11111111-1111-1111-1111-111111111192	t	f	\N	\N	0	\N	\N	\N	vi	Asia/Ho_Chi_Minh	t	2026-09-01 16:23:20.717027+00	2026-09-01 16:23:20.717027+00	\N	ADMIN	ACTIVE	f	0	\N	\N
\.


--
-- Data for Name: workflow_definitions; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.workflow_definitions (id, code, name, version, status, tenant_id, tenant_name, description, nodes_json, edges_json, is_template, template_category, created_at, updated_at, is_deleted) FROM stdin;
bef77039-9f57-47dd-bb53-b05ab3a6e821	WF-FAST-TRACK-2026	Quy Trình Sourcing Khẩn Cấp & Phê Duyệt Nhanh Fast-Track	v1.4	ACTIVE	11111111-1111-1111-1111-111111111111	Ban Mua Sắm Tập Trung EVN	Quy trình rút gọn xử lý sự cố thiết bị lưới điện truyền tải trong 48h với cơ chế phê duyệt ủy quyền 1 cấp Manager Bypass.	[{"id": "node-evn-start", "type": "START", "x": 80, "y": 240, "data": {"code": "START_FAST_TRACK", "title": "Khởi Động Thầu Khẩn Cấp Fast-Track", "subtitle": "Đáp ứng tiến độ đóng điện cấp bách 110kV", "department": "BID_MANAGEMENT", "slaDays": 1, "description": "Áp dụng cơ chế rút gọn theo điều 23 Luật Đấu thầu 2023 cho gói thầu mua sắm thay thế khẩn cấp", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["BID_MANAGER"]}}, {"id": "node-evn-prep", "type": "STAGE", "x": 320, "y": 240, "data": {"code": "STAGE_CABLE_SOIL", "title": "Đo Kiểm Điện Trở Suất Đất & Chiều Dài Tuyến", "subtitle": "Khảo sát thực địa tuyến cáp ngầm 110kV Tây Bắc", "department": "TECHNICAL", "slaDays": 2, "description": "Lập bản đồ rải cáp, xác định vị trí đặt hộp nối cáp chống nước và nối đất tiếp địa trạm", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 2}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["TECHNICAL_LEAD"]}}, {"id": "node-evn-sourcing", "type": "STAGE", "x": 600, "y": 240, "data": {"code": "STAGE_RFQ_FAST", "title": "Chào Giá Sourcing Nhanh Cáp XLPE 110kV", "subtitle": "Ưu tiên sẵn hàng trong kho (LS Cable, Prysmian)", "department": "PROCUREMENT", "slaDays": 2, "description": "Yêu cầu cam kết giao hàng trong 14 ngày làm việc và chứng nhận thử nghiệm điện áp cao", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 3}, "layer2Financial": {"enabled": true, "maxBudget": 28000000000}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["PROCUREMENT_LEAD"]}}, {"id": "node-evn-gatekeeper", "type": "GATEKEEPER", "x": 880, "y": 240, "data": {"code": "GATE_EMERGENCY_CHECK", "title": "Gatekeeper Kiểm Tra Sự Cố & Tiến Độ", "subtitle": "Xác nhận tính cấp bách và cam kết tiến độ", "department": "BID_MANAGEMENT", "slaDays": 1, "description": "Chốt chặn kiểm soát không vượt trần dự toán và văn bản phê duyệt mua sắm khẩn cấp của EVN", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 4}, "layer2Financial": {"enabled": true, "maxBudget": 30000000000}, "layer3Approval": {"enabled": true, "approvalMode": "ANY"}, "layer4DistributedLock": {"enabled": true, "redissonLockKey": "lock:evn:fasttrack:110kv"}}, "assignedRoles": ["BID_MANAGER"]}}, {"id": "node-evn-approval", "type": "APPROVAL", "x": 1160, "y": 240, "data": {"code": "APPROVAL_QUICK_CEO", "title": "Phê Duyệt Nhanh: Tổng Giám Đốc", "subtitle": "Ký điện tử trong vòng 4 giờ làm việc", "department": "BOARD_OF_DIRECTORS", "slaDays": 1, "description": "Ký duyệt quyết định chỉ định thầu rút gọn hoặc phê duyệt kết quả chào giá cạnh tranh", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": true, "approvalMode": "ANY"}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["CEO"]}}, {"id": "node-evn-webhook", "type": "WEBHOOK", "x": 1420, "y": 240, "data": {"code": "WEBHOOK_EVN_PORTAL", "title": "Công Khai Kết Quả Lên Cổng EVN Portal", "subtitle": "Đồng bộ API minh bạch kết quả mua sắm", "department": "FINANCE", "slaDays": 1, "description": "Tự động đăng tải thông báo kết quả lựa chọn nhà thầu và tạo đơn đặt hàng PO", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["BID_MANAGER"]}}, {"id": "node-evn-end", "type": "END", "x": 1660, "y": 240, "data": {"code": "END_FAST_DELIVERY", "title": "Phát Lệnh Giao Hàng & Bàn Giao", "subtitle": "Chuyển giao cáp ngầm tới công trường", "department": "LOGISTICS", "slaDays": 1, "description": "Hoàn tất nghiệm thu tiếp nhận tại công trường, chuẩn bị thi công kéo rải cáp", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["LOGISTICS_LEAD"]}}]	[{"id": "e-evn-1", "sourceNodeId": "node-evn-start", "targetNodeId": "node-evn-prep", "label": "Khảo sát nhanh"}, {"id": "e-evn-2", "sourceNodeId": "node-evn-prep", "targetNodeId": "node-evn-sourcing", "label": "Có thông số tuyến cáp"}, {"id": "e-evn-3", "sourceNodeId": "node-evn-sourcing", "targetNodeId": "node-evn-gatekeeper", "label": "Nhận báo giá 48h"}, {"id": "e-evn-4", "sourceNodeId": "node-evn-gatekeeper", "targetNodeId": "node-evn-approval", "label": "Đạt chốt chặn khẩn cấp", "color": "#10b981"}, {"id": "e-evn-5", "sourceNodeId": "node-evn-gatekeeper", "targetNodeId": "node-evn-sourcing", "label": "Giá vượt hạn mức cho phép", "color": "#ef4444"}, {"id": "e-evn-6", "sourceNodeId": "node-evn-approval", "targetNodeId": "node-evn-webhook", "label": "Ký số ban hành"}, {"id": "e-evn-7", "sourceNodeId": "node-evn-webhook", "targetNodeId": "node-evn-end", "label": "Đăng tải hoàn tất", "color": "#10b981"}]	f	\N	2026-09-01 16:12:59.774597+00	2026-09-02 05:27:57.063309+00	f
284e2dda-b5f4-44dc-a3f7-3c93279e9906	WF-FAST-TRACK-2026	Quy Trình Sourcing Khẩn Cấp & Phê Duyệt Nhanh Fast-Track	v1.4	ACTIVE	\N	Ban Mua Sắm Tập Trung EVN	Quy trình rút gọn xử lý sự cố thiết bị lưới điện truyền tải trong 48h với cơ chế phê duyệt ủy quyền 1 cấp Manager Bypass.	[{"id": "node-evn-start", "type": "START", "x": 80, "y": 240, "data": {"code": "START_FAST_TRACK", "title": "Khởi Động Thầu Khẩn Cấp Fast-Track", "subtitle": "Đáp ứng tiến độ đóng điện cấp bách 110kV", "department": "BID_MANAGEMENT", "slaDays": 1, "description": "Áp dụng cơ chế rút gọn theo điều 23 Luật Đấu thầu 2023 cho gói thầu mua sắm thay thế khẩn cấp", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["BID_MANAGER"]}}, {"id": "node-evn-prep", "type": "STAGE", "x": 320, "y": 240, "data": {"code": "STAGE_CABLE_SOIL", "title": "Đo Kiểm Điện Trở Suất Đất & Chiều Dài Tuyến", "subtitle": "Khảo sát thực địa tuyến cáp ngầm 110kV Tây Bắc", "department": "TECHNICAL", "slaDays": 2, "description": "Lập bản đồ rải cáp, xác định vị trí đặt hộp nối cáp chống nước và nối đất tiếp địa trạm", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 2}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["TECHNICAL_LEAD"]}}, {"id": "node-evn-sourcing", "type": "STAGE", "x": 600, "y": 240, "data": {"code": "STAGE_RFQ_FAST", "title": "Chào Giá Sourcing Nhanh Cáp XLPE 110kV", "subtitle": "Ưu tiên sẵn hàng trong kho (LS Cable, Prysmian)", "department": "PROCUREMENT", "slaDays": 2, "description": "Yêu cầu cam kết giao hàng trong 14 ngày làm việc và chứng nhận thử nghiệm điện áp cao", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 3}, "layer2Financial": {"enabled": true, "maxBudget": 28000000000}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["PROCUREMENT_LEAD"]}}, {"id": "node-evn-gatekeeper", "type": "GATEKEEPER", "x": 880, "y": 240, "data": {"code": "GATE_EMERGENCY_CHECK", "title": "Gatekeeper Kiểm Tra Sự Cố & Tiến Độ", "subtitle": "Xác nhận tính cấp bách và cam kết tiến độ", "department": "BID_MANAGEMENT", "slaDays": 1, "description": "Chốt chặn kiểm soát không vượt trần dự toán và văn bản phê duyệt mua sắm khẩn cấp của EVN", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 4}, "layer2Financial": {"enabled": true, "maxBudget": 30000000000}, "layer3Approval": {"enabled": true, "approvalMode": "ANY"}, "layer4DistributedLock": {"enabled": true, "redissonLockKey": "lock:evn:fasttrack:110kv"}}, "assignedRoles": ["BID_MANAGER"]}}, {"id": "node-evn-approval", "type": "APPROVAL", "x": 1160, "y": 240, "data": {"code": "APPROVAL_QUICK_CEO", "title": "Phê Duyệt Nhanh: Tổng Giám Đốc", "subtitle": "Ký điện tử trong vòng 4 giờ làm việc", "department": "BOARD_OF_DIRECTORS", "slaDays": 1, "description": "Ký duyệt quyết định chỉ định thầu rút gọn hoặc phê duyệt kết quả chào giá cạnh tranh", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": true, "approvalMode": "ANY"}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["CEO"]}}, {"id": "node-evn-webhook", "type": "WEBHOOK", "x": 1420, "y": 240, "data": {"code": "WEBHOOK_EVN_PORTAL", "title": "Công Khai Kết Quả Lên Cổng EVN Portal", "subtitle": "Đồng bộ API minh bạch kết quả mua sắm", "department": "FINANCE", "slaDays": 1, "description": "Tự động đăng tải thông báo kết quả lựa chọn nhà thầu và tạo đơn đặt hàng PO", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["BID_MANAGER"]}}, {"id": "node-evn-end", "type": "END", "x": 1660, "y": 240, "data": {"code": "END_FAST_DELIVERY", "title": "Phát Lệnh Giao Hàng & Bàn Giao", "subtitle": "Chuyển giao cáp ngầm tới công trường", "department": "LOGISTICS", "slaDays": 1, "description": "Hoàn tất nghiệm thu tiếp nhận tại công trường, chuẩn bị thi công kéo rải cáp", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["LOGISTICS_LEAD"]}}]	[{"id": "e-evn-1", "sourceNodeId": "node-evn-start", "targetNodeId": "node-evn-prep", "label": "Khảo sát nhanh"}, {"id": "e-evn-2", "sourceNodeId": "node-evn-prep", "targetNodeId": "node-evn-sourcing", "label": "Có thông số tuyến cáp"}, {"id": "e-evn-3", "sourceNodeId": "node-evn-sourcing", "targetNodeId": "node-evn-gatekeeper", "label": "Nhận báo giá 48h"}, {"id": "e-evn-4", "sourceNodeId": "node-evn-gatekeeper", "targetNodeId": "node-evn-approval", "label": "Đạt chốt chặn khẩn cấp", "color": "#10b981"}, {"id": "e-evn-5", "sourceNodeId": "node-evn-gatekeeper", "targetNodeId": "node-evn-sourcing", "label": "Giá vượt hạn mức cho phép", "color": "#ef4444"}, {"id": "e-evn-6", "sourceNodeId": "node-evn-approval", "targetNodeId": "node-evn-webhook", "label": "Ký số ban hành"}, {"id": "e-evn-7", "sourceNodeId": "node-evn-webhook", "targetNodeId": "node-evn-end", "label": "Đăng tải hoàn tất", "color": "#10b981"}]	t	FAST_TRACK	2026-09-01 16:23:53.511474+00	2026-09-02 05:27:57.063309+00	f
fcad2497-cc41-4999-abc5-0065647294e9	WF-SPARE-PARTS-2026	Quy Trình Mua Sắm Phụ Tùng Máy Biến Áp & Dầu Cách Điện	v1.2	DRAFT	11111111-1111-1111-1111-111111111111	Tổng Công Ty Thiết Bị Điện Đông Anh (EEMC)	Quy trình định kỳ mua sắm vật tư tiêu hao, sứ xuyên và dầu máy biến áp theo hợp đồng khung 12 tháng.	[{"id": "node-metro-start", "type": "START", "x": 80, "y": 240, "data": {"code": "START_METRO", "title": "Khởi Động Gói Thầu Tín Hiệu Metro", "subtitle": "Kích hoạt tiêu chuẩn đường sắt đô thị EN 50126", "department": "BID_MANAGEMENT", "slaDays": 1, "description": "Nghiên cứu yêu cầu kỹ thuật hệ thống điều khiển tàu tự động CBTC tuyến Metro số 3", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["BID_MANAGER"]}}, {"id": "node-metro-rams", "type": "TASK", "x": 300, "y": 240, "data": {"code": "TASK_RAMS_AUDIT", "title": "Đánh Giá Độ An Toàn RAMS (SIL-4)", "subtitle": "Thẩm tra độ tin cậy, sẵn sàng, bảo trì & an toàn", "department": "TECHNICAL", "slaDays": 4, "description": "Yêu cầu chứng chỉ TÜV Rheinland cho thiết bị vi xử lý điều khiển trung tâm OCC", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 3}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["TECHNICAL_LEAD"]}}, {"id": "node-metro-emc", "type": "TASK", "x": 560, "y": 240, "data": {"code": "TASK_EMC_TEST", "title": "Thử Nghiệm Tương Thích Điện Từ EMC", "subtitle": "Chống can nhiễu từ trường sóng vô tuyến", "department": "TECHNICAL", "slaDays": 3, "description": "Đo kiểm khả năng chống nhiễu từ đường ray thứ 3 điện áp 750V DC sang cáp tín hiệu", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 2}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["TECHNICAL_LEAD"]}}, {"id": "node-metro-sourcing", "type": "STAGE", "x": 820, "y": 240, "data": {"code": "STAGE_ATO_SOURCING", "title": "Sourcing Thiết Bị Lắp Trên Đoàn Tàu (On-board ATO)", "subtitle": "Chào giá từ Alstom, Siemens, Hitachi Rail", "department": "PROCUREMENT", "slaDays": 5, "description": "Lựa chọn ăng-ten thu nhận tín hiệu balise và bộ điều khiển phanh khẩn cấp tự động", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 4}, "layer2Financial": {"enabled": true, "maxBudget": 75000000000}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["PROCUREMENT_LEAD"]}}, {"id": "node-metro-gatekeeper", "type": "GATEKEEPER", "x": 1080, "y": 240, "data": {"code": "GATE_METRO_SAFETY", "title": "Gatekeeper Kiểm Định An Toàn Cục Đường Sắt", "subtitle": "Đạt 100% tiêu chí an toàn trước khi tích hợp", "department": "LEGAL", "slaDays": 2, "description": "Hồ sơ thẩm định phải có chữ ký của Tư vấn độc lập ISA (Independent Safety Assessor)", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 5}, "layer2Financial": {"enabled": true, "maxBudget": 80000000000}, "layer3Approval": {"enabled": true, "approvalMode": "ALL_PARALLEL"}, "layer4DistributedLock": {"enabled": true, "redissonLockKey": "lock:metro:cbtc:safety"}}, "assignedRoles": ["LEGAL_COUNSEL", "BID_MANAGER"]}}, {"id": "node-metro-approval", "type": "APPROVAL", "x": 1340, "y": 240, "data": {"code": "APPROVAL_METRO_BOARD", "title": "Phê Duyệt Ban Quản Lý Đường Sắt Đô Thị (MRB)", "subtitle": "Hội đồng nghiệm thu kỹ thuật phê duyệt", "department": "BOARD_OF_DIRECTORS", "slaDays": 2, "description": "Ký kết nghiệm thu bàn giao hồ sơ thiết kế kỹ thuật thi công và phương án chạy thử", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": true, "approvalMode": "ALL_PARALLEL"}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["CEO"]}}, {"id": "node-metro-webhook", "type": "WEBHOOK", "x": 1580, "y": 240, "data": {"code": "WEBHOOK_TRAIN_TEST", "title": "Kích Hoạt Kịch Bản Chạy Thử Liên Động (Trial Run)", "subtitle": "Gửi tín hiệu Webhook tới trung tâm điều hành OCC", "department": "TECHNICAL", "slaDays": 1, "description": "Lập lịch chạy thử 5.000 km không tải để kiểm tra tỷ lệ đúng giờ và khoảng cách dừng đỗ", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["TECHNICAL_LEAD"]}}, {"id": "node-metro-end", "type": "END", "x": 1820, "y": 240, "data": {"code": "END_METRO_COMMISSION", "title": "Nghiệm Thu Đưa Vào Vận Hành Thương Mại", "subtitle": "Bàn giao chìa khóa trao tay cho Hanoi Metro", "department": "BID_MANAGEMENT", "slaDays": 1, "description": "Cấp chứng chỉ nghiệm thu bàn giao tạm thời PAC và chuyển sang giai đoạn bảo hành 2 năm", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["BID_MANAGER"]}}]	[{"id": "e-metro-1", "sourceNodeId": "node-metro-start", "targetNodeId": "node-metro-rams", "label": "Khảo sát an toàn"}, {"id": "e-metro-2", "sourceNodeId": "node-metro-rams", "targetNodeId": "node-metro-emc", "label": "Đạt chuẩn SIL-4"}, {"id": "e-metro-3", "sourceNodeId": "node-metro-emc", "targetNodeId": "node-metro-sourcing", "label": "Đạt chống nhiễu EMC"}, {"id": "e-metro-4", "sourceNodeId": "node-metro-sourcing", "targetNodeId": "node-metro-gatekeeper", "label": "Chốt nhà thầu Alstom"}, {"id": "e-metro-5", "sourceNodeId": "node-metro-gatekeeper", "targetNodeId": "node-metro-approval", "label": "Tư vấn ISA chấp thuận", "color": "#10b981"}, {"id": "e-metro-6", "sourceNodeId": "node-metro-gatekeeper", "targetNodeId": "node-metro-rams", "label": "Yêu cầu kiểm tra lại RAMS", "color": "#ef4444"}, {"id": "e-metro-7", "sourceNodeId": "node-metro-approval", "targetNodeId": "node-metro-webhook", "label": "MRB thông qua"}, {"id": "e-metro-8", "sourceNodeId": "node-metro-webhook", "targetNodeId": "node-metro-end", "label": "Trial run 5000km thành công", "color": "#10b981"}]	f	\N	2026-09-01 16:12:59.775804+00	2026-09-02 05:27:57.111006+00	f
5002d2ff-486f-4be8-87e8-04d8bb6ae22c	WF-EEMC-2026-v2.1	Quy Trình Quản Lý Hồ Sơ Thầu & Gatekeeper Thiết Bị 220kV	v2.1	ACTIVE	11111111-1111-1111-1111-111111111111	Tổng Công Ty Thiết Bị Điện Đông Anh (EEMC)	Quy trình chuẩn hóa toàn diện từ tiếp nhận HSMT, phân rã BoQ, sourcing Magic Link, tính toán Landed Cost đa ngoại tệ đến kiểm soát 4 lớp Gatekeeper.	[{"id": "node-eemc-start", "type": "START", "x": 80, "y": 240, "data": {"code": "START_EEMC", "title": "Khởi Động Gói Thầu 220kV", "subtitle": "Kích hoạt hồ sơ dự thầu trạm 220kV Đông Anh", "department": "BID_MANAGEMENT", "slaDays": 1, "description": "Tiếp nhận thông báo mời thầu và kiểm tra điều kiện pháp lý tiên quyết", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["BID_MANAGER"]}}, {"id": "node-eemc-prep", "type": "STAGE", "x": 300, "y": 240, "data": {"code": "STAGE_PREP_TECH", "title": "Bóc Tách BoQ & Thẩm Định Kỹ Thuật", "subtitle": "Đánh giá thông số tổn hao Po, Pk & Dung lượng 250MVA", "department": "TECHNICAL", "slaDays": 3, "description": "Phân tích bản vẽ kết cấu ruột máy, tính toán tổn hao theo tiêu chuẩn IEC 60076", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 3}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["TECHNICAL_LEAD"]}}, {"id": "node-eemc-cond-fat", "type": "CONDITION", "x": 560, "y": 240, "data": {"code": "COND_FAT_KEMA", "title": "Phân Loại Thử Nghiệm FAT", "subtitle": "Đoản mạch đặc biệt KEMA hay Chuẩn xuất xưởng?", "department": "TECHNICAL", "slaDays": 1, "description": "Xác định gói thầu có bắt buộc chứng chỉ ngắn mạch phòng thí nghiệm độc lập quốc tế KEMA", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "conditionBranches": [{"id": "b-kema", "label": "Yêu Cầu Thử Ngắn Mạch KEMA", "expression": "is_kema_required == true", "targetNodeId": "node-eemc-kema-task"}, {"id": "b-std", "label": "FAT Nhà Máy Tiêu Chuẩn", "expression": "is_kema_required == false", "targetNodeId": "node-eemc-sourcing"}], "assignedRoles": ["TECHNICAL_LEAD"]}}, {"id": "node-eemc-kema-task", "type": "TASK", "x": 800, "y": 100, "data": {"code": "TASK_KEMA_INSPECT", "title": "Kế Hoạch Kiểm Định KEMA Quốc Tế", "subtitle": "Thu xếp chứng thư kiểm định ngắn mạch tại Hà Lan", "department": "TECHNICAL", "slaDays": 5, "description": "Liên hệ đại diện KEMA Arnhem để phê duyệt quy trình đo xung sét 1050kV và quá áp liên tục", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 2}, "layer2Financial": {"enabled": true, "maxBudget": 500000000}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["TECHNICAL_LEAD"]}}, {"id": "node-eemc-sourcing", "type": "STAGE", "x": 1040, "y": 240, "data": {"code": "STAGE_SOURCING_MATERIALS", "title": "Sourcing Vật Tư Cốt Lõi (Sứ Xuyên, Tôn Silic)", "subtitle": "Phát hành RFQ chào giá 3 hãng G7", "department": "PROCUREMENT", "slaDays": 4, "description": "Lựa chọn bộ Sứ xuyên RIP 220kV, Bộ đổi nấc dưới tải OLTC Reinhausen và Dầu máy biến áp", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 4}, "layer2Financial": {"enabled": true, "maxBudget": 45000000000}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["PROCUREMENT_LEAD"]}}, {"id": "node-eemc-gatekeeper", "type": "GATEKEEPER", "x": 1300, "y": 240, "data": {"code": "GATE_QUALITY_4LAYERS", "title": "Quality Gate 4 Tầng & Chống Thầu Ảo", "subtitle": "Khóa phân tán Redisson + Đối soát số dư bảo lãnh", "department": "BID_MANAGEMENT", "slaDays": 1, "description": "Kiểm tra 100% hồ sơ pháp lý, ngân sách Landed Cost và chặn trùng lặp gói thầu trên Redis", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 6}, "layer2Financial": {"enabled": true, "maxBudget": 60000000000}, "layer3Approval": {"enabled": true, "approvalMode": "ALL_PARALLEL"}, "layer4DistributedLock": {"enabled": true, "redissonLockKey": "lock:eemc:tender:220kv"}}, "assignedRoles": ["BID_MANAGER", "CFO"]}}, {"id": "node-eemc-approval", "type": "APPROVAL", "x": 1560, "y": 240, "data": {"code": "APPROVAL_BOD_CFO", "title": "Phê Duyệt Song Song: HĐQT & Giám Đốc Tài Chính", "subtitle": "Ký số token PKI & Phê duyệt giá nộp thầu", "department": "BOARD_OF_DIRECTORS", "slaDays": 2, "description": "Ban Giám đốc phê duyệt phương án giá dự thầu, CFO phê duyệt hạn mức bảo lãnh ngân hàng BIDV", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": true, "approvalMode": "ALL_PARALLEL"}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["CEO", "CFO"]}}, {"id": "node-eemc-webhook", "type": "WEBHOOK", "x": 1800, "y": 240, "data": {"code": "WEBHOOK_SAP_ERP", "title": "Đồng Bộ Dự Toán Sang SAP S/4HANA", "subtitle": "Webhook REST API hạch toán Process Code 992", "department": "FINANCE", "slaDays": 1, "description": "Đẩy số liệu chi phí định mức BOM và kế hoạch giải ngân vốn sang hệ thống ERP doanh nghiệp", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["CFO"]}}, {"id": "node-eemc-end", "type": "END", "x": 2040, "y": 240, "data": {"code": "END_SUBMITTED", "title": "Nộp Thầu Thành Công & Lưu Trữ Mã Hóa", "subtitle": "Niêm phong hồ sơ số trên Cổng Đấu thầu Quốc gia", "department": "BID_MANAGEMENT", "slaDays": 1, "description": "Ghi nhận biên lai nộp thầu thành công, lưu trữ khóa bí mật và chuyển sang trạng thái theo dõi chấm thầu", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["BID_MANAGER"]}}]	[{"id": "e-eemc-1", "sourceNodeId": "node-eemc-start", "targetNodeId": "node-eemc-prep", "label": "Bắt đầu khảo sát"}, {"id": "e-eemc-2", "sourceNodeId": "node-eemc-prep", "targetNodeId": "node-eemc-cond-fat", "label": "Chuyển thẩm định FAT"}, {"id": "e-eemc-3", "sourceNodeId": "node-eemc-cond-fat", "targetNodeId": "node-eemc-kema-task", "label": "Cần thử nghiệm KEMA", "color": "#8b5cf6"}, {"id": "e-eemc-4", "sourceNodeId": "node-eemc-cond-fat", "targetNodeId": "node-eemc-sourcing", "label": "FAT nhà máy đạt chuẩn", "color": "#10b981"}, {"id": "e-eemc-5", "sourceNodeId": "node-eemc-kema-task", "targetNodeId": "node-eemc-sourcing", "label": "Chứng chỉ KEMA hoàn tất"}, {"id": "e-eemc-6", "sourceNodeId": "node-eemc-sourcing", "targetNodeId": "node-eemc-gatekeeper", "label": "Đầy đủ báo giá NCC"}, {"id": "e-eemc-7", "sourceNodeId": "node-eemc-gatekeeper", "targetNodeId": "node-eemc-approval", "label": "Vượt qua Gatekeeper", "color": "#10b981"}, {"id": "e-eemc-8", "sourceNodeId": "node-eemc-gatekeeper", "targetNodeId": "node-eemc-prep", "label": "Bị từ chối / Hoàn trả làm rõ BoQ", "color": "#ef4444"}, {"id": "e-eemc-9", "sourceNodeId": "node-eemc-approval", "targetNodeId": "node-eemc-webhook", "label": "HĐQT phê duyệt"}, {"id": "e-eemc-10", "sourceNodeId": "node-eemc-webhook", "targetNodeId": "node-eemc-end", "label": "Đồng bộ ERP hoàn tất", "color": "#10b981"}]	f	\N	2026-09-01 16:12:59.763562+00	2026-09-02 05:27:56.965968+00	f
cb8a1ddb-7edf-4447-ad67-6c348df5b0cd	WF-EEMC-2026-v2.1	Quy Trình Quản Lý Hồ Sơ Thầu & Gatekeeper Thiết Bị 220kV	v2.1	ACTIVE	\N	Tổng Công Ty Thiết Bị Điện Đông Anh (EEMC)	Quy trình chuẩn hóa toàn diện từ tiếp nhận HSMT, phân rã BoQ, sourcing Magic Link, tính toán Landed Cost đa ngoại tệ đến kiểm soát 4 lớp Gatekeeper.	[{"id": "node-eemc-start", "type": "START", "x": 80, "y": 240, "data": {"code": "START_EEMC", "title": "Khởi Động Gói Thầu 220kV", "subtitle": "Kích hoạt hồ sơ dự thầu trạm 220kV Đông Anh", "department": "BID_MANAGEMENT", "slaDays": 1, "description": "Tiếp nhận thông báo mời thầu và kiểm tra điều kiện pháp lý tiên quyết", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["BID_MANAGER"]}}, {"id": "node-eemc-prep", "type": "STAGE", "x": 300, "y": 240, "data": {"code": "STAGE_PREP_TECH", "title": "Bóc Tách BoQ & Thẩm Định Kỹ Thuật", "subtitle": "Đánh giá thông số tổn hao Po, Pk & Dung lượng 250MVA", "department": "TECHNICAL", "slaDays": 3, "description": "Phân tích bản vẽ kết cấu ruột máy, tính toán tổn hao theo tiêu chuẩn IEC 60076", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 3}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["TECHNICAL_LEAD"]}}, {"id": "node-eemc-cond-fat", "type": "CONDITION", "x": 560, "y": 240, "data": {"code": "COND_FAT_KEMA", "title": "Phân Loại Thử Nghiệm FAT", "subtitle": "Đoản mạch đặc biệt KEMA hay Chuẩn xuất xưởng?", "department": "TECHNICAL", "slaDays": 1, "description": "Xác định gói thầu có bắt buộc chứng chỉ ngắn mạch phòng thí nghiệm độc lập quốc tế KEMA", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "conditionBranches": [{"id": "b-kema", "label": "Yêu Cầu Thử Ngắn Mạch KEMA", "expression": "is_kema_required == true", "targetNodeId": "node-eemc-kema-task"}, {"id": "b-std", "label": "FAT Nhà Máy Tiêu Chuẩn", "expression": "is_kema_required == false", "targetNodeId": "node-eemc-sourcing"}], "assignedRoles": ["TECHNICAL_LEAD"]}}, {"id": "node-eemc-kema-task", "type": "TASK", "x": 800, "y": 100, "data": {"code": "TASK_KEMA_INSPECT", "title": "Kế Hoạch Kiểm Định KEMA Quốc Tế", "subtitle": "Thu xếp chứng thư kiểm định ngắn mạch tại Hà Lan", "department": "TECHNICAL", "slaDays": 5, "description": "Liên hệ đại diện KEMA Arnhem để phê duyệt quy trình đo xung sét 1050kV và quá áp liên tục", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 2}, "layer2Financial": {"enabled": true, "maxBudget": 500000000}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["TECHNICAL_LEAD"]}}, {"id": "node-eemc-sourcing", "type": "STAGE", "x": 1040, "y": 240, "data": {"code": "STAGE_SOURCING_MATERIALS", "title": "Sourcing Vật Tư Cốt Lõi (Sứ Xuyên, Tôn Silic)", "subtitle": "Phát hành RFQ chào giá 3 hãng G7", "department": "PROCUREMENT", "slaDays": 4, "description": "Lựa chọn bộ Sứ xuyên RIP 220kV, Bộ đổi nấc dưới tải OLTC Reinhausen và Dầu máy biến áp", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 4}, "layer2Financial": {"enabled": true, "maxBudget": 45000000000}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["PROCUREMENT_LEAD"]}}, {"id": "node-eemc-gatekeeper", "type": "GATEKEEPER", "x": 1300, "y": 240, "data": {"code": "GATE_QUALITY_4LAYERS", "title": "Quality Gate 4 Tầng & Chống Thầu Ảo", "subtitle": "Khóa phân tán Redisson + Đối soát số dư bảo lãnh", "department": "BID_MANAGEMENT", "slaDays": 1, "description": "Kiểm tra 100% hồ sơ pháp lý, ngân sách Landed Cost và chặn trùng lặp gói thầu trên Redis", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 6}, "layer2Financial": {"enabled": true, "maxBudget": 60000000000}, "layer3Approval": {"enabled": true, "approvalMode": "ALL_PARALLEL"}, "layer4DistributedLock": {"enabled": true, "redissonLockKey": "lock:eemc:tender:220kv"}}, "assignedRoles": ["BID_MANAGER", "CFO"]}}, {"id": "node-eemc-approval", "type": "APPROVAL", "x": 1560, "y": 240, "data": {"code": "APPROVAL_BOD_CFO", "title": "Phê Duyệt Song Song: HĐQT & Giám Đốc Tài Chính", "subtitle": "Ký số token PKI & Phê duyệt giá nộp thầu", "department": "BOARD_OF_DIRECTORS", "slaDays": 2, "description": "Ban Giám đốc phê duyệt phương án giá dự thầu, CFO phê duyệt hạn mức bảo lãnh ngân hàng BIDV", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": true, "approvalMode": "ALL_PARALLEL"}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["CEO", "CFO"]}}, {"id": "node-eemc-webhook", "type": "WEBHOOK", "x": 1800, "y": 240, "data": {"code": "WEBHOOK_SAP_ERP", "title": "Đồng Bộ Dự Toán Sang SAP S/4HANA", "subtitle": "Webhook REST API hạch toán Process Code 992", "department": "FINANCE", "slaDays": 1, "description": "Đẩy số liệu chi phí định mức BOM và kế hoạch giải ngân vốn sang hệ thống ERP doanh nghiệp", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["CFO"]}}, {"id": "node-eemc-end", "type": "END", "x": 2040, "y": 240, "data": {"code": "END_SUBMITTED", "title": "Nộp Thầu Thành Công & Lưu Trữ Mã Hóa", "subtitle": "Niêm phong hồ sơ số trên Cổng Đấu thầu Quốc gia", "department": "BID_MANAGEMENT", "slaDays": 1, "description": "Ghi nhận biên lai nộp thầu thành công, lưu trữ khóa bí mật và chuyển sang trạng thái theo dõi chấm thầu", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["BID_MANAGER"]}}]	[{"id": "e-eemc-1", "sourceNodeId": "node-eemc-start", "targetNodeId": "node-eemc-prep", "label": "Bắt đầu khảo sát"}, {"id": "e-eemc-2", "sourceNodeId": "node-eemc-prep", "targetNodeId": "node-eemc-cond-fat", "label": "Chuyển thẩm định FAT"}, {"id": "e-eemc-3", "sourceNodeId": "node-eemc-cond-fat", "targetNodeId": "node-eemc-kema-task", "label": "Cần thử nghiệm KEMA", "color": "#8b5cf6"}, {"id": "e-eemc-4", "sourceNodeId": "node-eemc-cond-fat", "targetNodeId": "node-eemc-sourcing", "label": "FAT nhà máy đạt chuẩn", "color": "#10b981"}, {"id": "e-eemc-5", "sourceNodeId": "node-eemc-kema-task", "targetNodeId": "node-eemc-sourcing", "label": "Chứng chỉ KEMA hoàn tất"}, {"id": "e-eemc-6", "sourceNodeId": "node-eemc-sourcing", "targetNodeId": "node-eemc-gatekeeper", "label": "Đầy đủ báo giá NCC"}, {"id": "e-eemc-7", "sourceNodeId": "node-eemc-gatekeeper", "targetNodeId": "node-eemc-approval", "label": "Vượt qua Gatekeeper", "color": "#10b981"}, {"id": "e-eemc-8", "sourceNodeId": "node-eemc-gatekeeper", "targetNodeId": "node-eemc-prep", "label": "Bị từ chối / Hoàn trả làm rõ BoQ", "color": "#ef4444"}, {"id": "e-eemc-9", "sourceNodeId": "node-eemc-approval", "targetNodeId": "node-eemc-webhook", "label": "HĐQT phê duyệt"}, {"id": "e-eemc-10", "sourceNodeId": "node-eemc-webhook", "targetNodeId": "node-eemc-end", "label": "Đồng bộ ERP hoàn tất", "color": "#10b981"}]	t	STANDARD_TENDER	2026-09-01 16:23:53.50974+00	2026-09-02 05:27:56.965968+00	f
7d158d18-2d03-4ec3-b9b5-ea275a847c15	WF-EPC-LOGISTICS-2026	Quy Trình Dự Thầu EPC Quốc Tế & Bảo Lãnh Swift Ngân Hàng	v1.0	DRAFT	11111111-1111-1111-1111-111111111111	Tập đoàn Dầu Khí Quốc Gia Việt Nam (PVN)	Quy trình đấu thầu quốc tế gói EPC Nhà máy điện Nhơn Trạch 3 & 4 kiểm soát tỷ giá Hedging, bảo lãnh MT760 và vận đơn B/L.	[{"id": "node-pvn-start", "type": "START", "x": 80, "y": 240, "data": {"code": "START_EPC_FIDIC", "title": "Khởi Động Gói Thầu EPC Quốc Tế", "subtitle": "Kích hoạt hợp đồng mẫu FIDIC Silver Book", "department": "BID_MANAGEMENT", "slaDays": 2, "description": "Nghiên cứu yêu cầu kỹ thuật nhà máy điện Nhơn Trạch 3&4 và các mốc tiến độ COD cam kết", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["BID_MANAGER"]}}, {"id": "node-pvn-prep", "type": "STAGE", "x": 300, "y": 240, "data": {"code": "STAGE_CONSORTIUM_SETUP", "title": "Thành Lập Liên Danh EPC Quốc Tế", "subtitle": "Thỏa thuận phân chia trách nhiệm Leader & Member", "department": "LEGAL", "slaDays": 5, "description": "Ký kết thỏa thuận liên danh (JVA), bảo lãnh chéo và cơ chế giải quyết tranh chấp trọng tài SIAC", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 4}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["LEGAL_COUNSEL"]}}, {"id": "node-pvn-cond-lc", "type": "CONDITION", "x": 560, "y": 240, "data": {"code": "COND_FINANCING_LC", "title": "Phương Thức Thanh Toán & Tín Dụng", "subtitle": "Thư tín dụng L/C trả chậm hay Bảo lãnh Swift MT760?", "department": "FINANCE", "slaDays": 2, "description": "Xác định cơ cấu nguồn vốn tài trợ xuất khẩu ECA từ ngân hàng JBIC / K-EXIM", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "conditionBranches": [{"id": "b-eca", "label": "Tài Trợ Quốc Tế ECA / L/C 360 Days", "expression": "is_eca_financing == true", "targetNodeId": "node-pvn-swift-task"}, {"id": "b-dom", "label": "Bảo Lãnh Ngân Hàng Nội Địa Vietcombank", "expression": "is_eca_financing == false", "targetNodeId": "node-pvn-sourcing"}], "assignedRoles": ["CFO"]}}, {"id": "node-pvn-swift-task", "type": "TASK", "x": 800, "y": 100, "data": {"code": "TASK_SWIFT_MT760", "title": "Phát Hành Điện Swift MT760 & Thẩm Định ECA", "subtitle": "Xác thực qua mạng viễn thông tài chính quốc tế", "department": "FINANCE", "slaDays": 4, "description": "Đàm phán phí xác nhận L/C, lãi suất SOFR + margin và cam kết bảo lãnh thực hiện hợp đồng", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 3}, "layer2Financial": {"enabled": true, "maxBudget": 2000000000}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["CFO"]}}, {"id": "node-pvn-sourcing", "type": "STAGE", "x": 1040, "y": 240, "data": {"code": "STAGE_TURBINE_HRSG", "title": "Sourcing Tua Bin H-Class & Lò HRSG ASME", "subtitle": "Đàm phán chào giá với GE Vernova & Doosan", "department": "PROCUREMENT", "slaDays": 7, "description": "Đối soát công suất phát 1500MW, cam kết phát thải môi trường và bảo hành 3 năm sau COD", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 5}, "layer2Financial": {"enabled": true, "maxBudget": 1200000000000}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["PROCUREMENT_LEAD"]}}, {"id": "node-pvn-gatekeeper", "type": "GATEKEEPER", "x": 1300, "y": 240, "data": {"code": "GATE_CAR_INSURANCE", "title": "Quality Gate Bảo Hiểm CAR & Giấy Phép Khí Thải", "subtitle": "Kiểm tra điều kiện tiên quyết trước khi ký hợp đồng", "department": "BID_MANAGEMENT", "slaDays": 2, "description": "Thẩm tra bảo hiểm mọi rủi ro xây dựng lắp đặt CAR hạn mức 500M USD và tiêu chuẩn QCVN 05:2023/BTNMT", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 8}, "layer2Financial": {"enabled": true, "maxBudget": 1500000000000}, "layer3Approval": {"enabled": true, "approvalMode": "ALL_PARALLEL"}, "layer4DistributedLock": {"enabled": true, "redissonLockKey": "lock:pvn:epc:nt34"}}, "assignedRoles": ["BID_MANAGER", "LEGAL_COUNSEL"]}}, {"id": "node-pvn-approval", "type": "APPROVAL", "x": 1560, "y": 240, "data": {"code": "APPROVAL_PVN_BOARD", "title": "Phê Duyệt HĐQT Tập Đoàn & Ủy Ban Quản Lý Vốn", "subtitle": "Nghị quyết phê duyệt nộp hồ sơ tài chính EPC", "department": "BOARD_OF_DIRECTORS", "slaDays": 3, "description": "Hội đồng Thành viên Tập đoàn Dầu khí Việt Nam phê duyệt hạn mức bảo lãnh và thư cam kết EPC", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": true, "approvalMode": "ALL_PARALLEL"}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["CEO", "CFO"]}}, {"id": "node-pvn-webhook", "type": "WEBHOOK", "x": 1800, "y": 240, "data": {"code": "WEBHOOK_VNACCS_CUSTOMS", "title": "Đồng Bộ Hệ Thống Hải Quan Điện Tử VNACCS", "subtitle": "Tự động đăng ký danh mục thiết bị siêu trường siêu trọng", "department": "LOGISTICS", "slaDays": 1, "description": "Khai báo tờ khai tạm nhập tái xuất và danh mục miễn thuế máy móc tạo tài sản cố định", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["LOGISTICS_LEAD"]}}, {"id": "node-pvn-end", "type": "END", "x": 2040, "y": 240, "data": {"code": "END_EPC_SUBMITTED", "title": "Hoàn Tất Nộp Thầu EPC Quốc Tế", "subtitle": "Niêm phong thùng hồ sơ kỹ thuật & tài chính", "department": "BID_MANAGEMENT", "slaDays": 1, "description": "Bàn giao hồ sơ tại Ban Quản lý Dự án Điện Nhơn Trạch, nhận biên bản mở thầu công khai", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["BID_MANAGER"]}}]	[{"id": "e-pvn-1", "sourceNodeId": "node-pvn-start", "targetNodeId": "node-pvn-prep", "label": "Khởi động liên danh"}, {"id": "e-pvn-2", "sourceNodeId": "node-pvn-prep", "targetNodeId": "node-pvn-cond-lc", "label": "Thẩm tra tài chính"}, {"id": "e-pvn-3", "sourceNodeId": "node-pvn-cond-lc", "targetNodeId": "node-pvn-swift-task", "label": "Vốn vay ECA / L/C quốc tế", "color": "#8b5cf6"}, {"id": "e-pvn-4", "sourceNodeId": "node-pvn-cond-lc", "targetNodeId": "node-pvn-sourcing", "label": "Bảo lãnh nội địa", "color": "#10b981"}, {"id": "e-pvn-5", "sourceNodeId": "node-pvn-swift-task", "targetNodeId": "node-pvn-sourcing", "label": "Khớp điện MT760 thành công"}, {"id": "e-pvn-6", "sourceNodeId": "node-pvn-sourcing", "targetNodeId": "node-pvn-gatekeeper", "label": "Chốt cấu hình Tua bin"}, {"id": "e-pvn-7", "sourceNodeId": "node-pvn-gatekeeper", "targetNodeId": "node-pvn-approval", "label": "Đủ điều kiện bảo hiểm CAR", "color": "#10b981"}, {"id": "e-pvn-8", "sourceNodeId": "node-pvn-gatekeeper", "targetNodeId": "node-pvn-sourcing", "label": "Yêu cầu đàm phán lại giá thiết bị", "color": "#ef4444"}, {"id": "e-pvn-9", "sourceNodeId": "node-pvn-approval", "targetNodeId": "node-pvn-webhook", "label": "Nghị quyết HĐQT ban hành"}, {"id": "e-pvn-10", "sourceNodeId": "node-pvn-webhook", "targetNodeId": "node-pvn-end", "label": "Khai báo hải quan thành công", "color": "#10b981"}]	f	\N	2026-09-01 16:12:59.775139+00	2026-09-02 05:27:57.014672+00	f
fa6d4df0-31f2-45c8-8b9f-ac63f065b84c	WF-EPC-LOGISTICS-2026	Quy Trình Dự Thầu EPC Quốc Tế & Bảo Lãnh Swift Ngân Hàng	v1.0	DRAFT	\N	Tập đoàn Dầu Khí Quốc Gia Việt Nam (PVN)	Quy trình đấu thầu quốc tế gói EPC Nhà máy điện Nhơn Trạch 3 & 4 kiểm soát tỷ giá Hedging, bảo lãnh MT760 và vận đơn B/L.	[{"id": "node-pvn-start", "type": "START", "x": 80, "y": 240, "data": {"code": "START_EPC_FIDIC", "title": "Khởi Động Gói Thầu EPC Quốc Tế", "subtitle": "Kích hoạt hợp đồng mẫu FIDIC Silver Book", "department": "BID_MANAGEMENT", "slaDays": 2, "description": "Nghiên cứu yêu cầu kỹ thuật nhà máy điện Nhơn Trạch 3&4 và các mốc tiến độ COD cam kết", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["BID_MANAGER"]}}, {"id": "node-pvn-prep", "type": "STAGE", "x": 300, "y": 240, "data": {"code": "STAGE_CONSORTIUM_SETUP", "title": "Thành Lập Liên Danh EPC Quốc Tế", "subtitle": "Thỏa thuận phân chia trách nhiệm Leader & Member", "department": "LEGAL", "slaDays": 5, "description": "Ký kết thỏa thuận liên danh (JVA), bảo lãnh chéo và cơ chế giải quyết tranh chấp trọng tài SIAC", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 4}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["LEGAL_COUNSEL"]}}, {"id": "node-pvn-cond-lc", "type": "CONDITION", "x": 560, "y": 240, "data": {"code": "COND_FINANCING_LC", "title": "Phương Thức Thanh Toán & Tín Dụng", "subtitle": "Thư tín dụng L/C trả chậm hay Bảo lãnh Swift MT760?", "department": "FINANCE", "slaDays": 2, "description": "Xác định cơ cấu nguồn vốn tài trợ xuất khẩu ECA từ ngân hàng JBIC / K-EXIM", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "conditionBranches": [{"id": "b-eca", "label": "Tài Trợ Quốc Tế ECA / L/C 360 Days", "expression": "is_eca_financing == true", "targetNodeId": "node-pvn-swift-task"}, {"id": "b-dom", "label": "Bảo Lãnh Ngân Hàng Nội Địa Vietcombank", "expression": "is_eca_financing == false", "targetNodeId": "node-pvn-sourcing"}], "assignedRoles": ["CFO"]}}, {"id": "node-pvn-swift-task", "type": "TASK", "x": 800, "y": 100, "data": {"code": "TASK_SWIFT_MT760", "title": "Phát Hành Điện Swift MT760 & Thẩm Định ECA", "subtitle": "Xác thực qua mạng viễn thông tài chính quốc tế", "department": "FINANCE", "slaDays": 4, "description": "Đàm phán phí xác nhận L/C, lãi suất SOFR + margin và cam kết bảo lãnh thực hiện hợp đồng", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 3}, "layer2Financial": {"enabled": true, "maxBudget": 2000000000}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["CFO"]}}, {"id": "node-pvn-sourcing", "type": "STAGE", "x": 1040, "y": 240, "data": {"code": "STAGE_TURBINE_HRSG", "title": "Sourcing Tua Bin H-Class & Lò HRSG ASME", "subtitle": "Đàm phán chào giá với GE Vernova & Doosan", "department": "PROCUREMENT", "slaDays": 7, "description": "Đối soát công suất phát 1500MW, cam kết phát thải môi trường và bảo hành 3 năm sau COD", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 5}, "layer2Financial": {"enabled": true, "maxBudget": 1200000000000}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["PROCUREMENT_LEAD"]}}, {"id": "node-pvn-gatekeeper", "type": "GATEKEEPER", "x": 1300, "y": 240, "data": {"code": "GATE_CAR_INSURANCE", "title": "Quality Gate Bảo Hiểm CAR & Giấy Phép Khí Thải", "subtitle": "Kiểm tra điều kiện tiên quyết trước khi ký hợp đồng", "department": "BID_MANAGEMENT", "slaDays": 2, "description": "Thẩm tra bảo hiểm mọi rủi ro xây dựng lắp đặt CAR hạn mức 500M USD và tiêu chuẩn QCVN 05:2023/BTNMT", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 8}, "layer2Financial": {"enabled": true, "maxBudget": 1500000000000}, "layer3Approval": {"enabled": true, "approvalMode": "ALL_PARALLEL"}, "layer4DistributedLock": {"enabled": true, "redissonLockKey": "lock:pvn:epc:nt34"}}, "assignedRoles": ["BID_MANAGER", "LEGAL_COUNSEL"]}}, {"id": "node-pvn-approval", "type": "APPROVAL", "x": 1560, "y": 240, "data": {"code": "APPROVAL_PVN_BOARD", "title": "Phê Duyệt HĐQT Tập Đoàn & Ủy Ban Quản Lý Vốn", "subtitle": "Nghị quyết phê duyệt nộp hồ sơ tài chính EPC", "department": "BOARD_OF_DIRECTORS", "slaDays": 3, "description": "Hội đồng Thành viên Tập đoàn Dầu khí Việt Nam phê duyệt hạn mức bảo lãnh và thư cam kết EPC", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": true, "approvalMode": "ALL_PARALLEL"}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["CEO", "CFO"]}}, {"id": "node-pvn-webhook", "type": "WEBHOOK", "x": 1800, "y": 240, "data": {"code": "WEBHOOK_VNACCS_CUSTOMS", "title": "Đồng Bộ Hệ Thống Hải Quan Điện Tử VNACCS", "subtitle": "Tự động đăng ký danh mục thiết bị siêu trường siêu trọng", "department": "LOGISTICS", "slaDays": 1, "description": "Khai báo tờ khai tạm nhập tái xuất và danh mục miễn thuế máy móc tạo tài sản cố định", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["LOGISTICS_LEAD"]}}, {"id": "node-pvn-end", "type": "END", "x": 2040, "y": 240, "data": {"code": "END_EPC_SUBMITTED", "title": "Hoàn Tất Nộp Thầu EPC Quốc Tế", "subtitle": "Niêm phong thùng hồ sơ kỹ thuật & tài chính", "department": "BID_MANAGEMENT", "slaDays": 1, "description": "Bàn giao hồ sơ tại Ban Quản lý Dự án Điện Nhơn Trạch, nhận biên bản mở thầu công khai", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["BID_MANAGER"]}}]	[{"id": "e-pvn-1", "sourceNodeId": "node-pvn-start", "targetNodeId": "node-pvn-prep", "label": "Khởi động liên danh"}, {"id": "e-pvn-2", "sourceNodeId": "node-pvn-prep", "targetNodeId": "node-pvn-cond-lc", "label": "Thẩm tra tài chính"}, {"id": "e-pvn-3", "sourceNodeId": "node-pvn-cond-lc", "targetNodeId": "node-pvn-swift-task", "label": "Vốn vay ECA / L/C quốc tế", "color": "#8b5cf6"}, {"id": "e-pvn-4", "sourceNodeId": "node-pvn-cond-lc", "targetNodeId": "node-pvn-sourcing", "label": "Bảo lãnh nội địa", "color": "#10b981"}, {"id": "e-pvn-5", "sourceNodeId": "node-pvn-swift-task", "targetNodeId": "node-pvn-sourcing", "label": "Khớp điện MT760 thành công"}, {"id": "e-pvn-6", "sourceNodeId": "node-pvn-sourcing", "targetNodeId": "node-pvn-gatekeeper", "label": "Chốt cấu hình Tua bin"}, {"id": "e-pvn-7", "sourceNodeId": "node-pvn-gatekeeper", "targetNodeId": "node-pvn-approval", "label": "Đủ điều kiện bảo hiểm CAR", "color": "#10b981"}, {"id": "e-pvn-8", "sourceNodeId": "node-pvn-gatekeeper", "targetNodeId": "node-pvn-sourcing", "label": "Yêu cầu đàm phán lại giá thiết bị", "color": "#ef4444"}, {"id": "e-pvn-9", "sourceNodeId": "node-pvn-approval", "targetNodeId": "node-pvn-webhook", "label": "Nghị quyết HĐQT ban hành"}, {"id": "e-pvn-10", "sourceNodeId": "node-pvn-webhook", "targetNodeId": "node-pvn-end", "label": "Khai báo hải quan thành công", "color": "#10b981"}]	t	INTERNATIONAL_EPC	2026-09-01 16:23:53.512276+00	2026-09-02 05:27:57.014672+00	f
e6cd6c44-63da-4448-a3db-4cc6a159edc7	WF-SPARE-PARTS-2026	Quy Trình Mua Sắm Phụ Tùng Máy Biến Áp & Dầu Cách Điện	v1.2	DRAFT	\N	Tổng Công Ty Thiết Bị Điện Đông Anh (EEMC)	Quy trình định kỳ mua sắm vật tư tiêu hao, sứ xuyên và dầu máy biến áp theo hợp đồng khung 12 tháng.	[{"id": "node-metro-start", "type": "START", "x": 80, "y": 240, "data": {"code": "START_METRO", "title": "Khởi Động Gói Thầu Tín Hiệu Metro", "subtitle": "Kích hoạt tiêu chuẩn đường sắt đô thị EN 50126", "department": "BID_MANAGEMENT", "slaDays": 1, "description": "Nghiên cứu yêu cầu kỹ thuật hệ thống điều khiển tàu tự động CBTC tuyến Metro số 3", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["BID_MANAGER"]}}, {"id": "node-metro-rams", "type": "TASK", "x": 300, "y": 240, "data": {"code": "TASK_RAMS_AUDIT", "title": "Đánh Giá Độ An Toàn RAMS (SIL-4)", "subtitle": "Thẩm tra độ tin cậy, sẵn sàng, bảo trì & an toàn", "department": "TECHNICAL", "slaDays": 4, "description": "Yêu cầu chứng chỉ TÜV Rheinland cho thiết bị vi xử lý điều khiển trung tâm OCC", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 3}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["TECHNICAL_LEAD"]}}, {"id": "node-metro-emc", "type": "TASK", "x": 560, "y": 240, "data": {"code": "TASK_EMC_TEST", "title": "Thử Nghiệm Tương Thích Điện Từ EMC", "subtitle": "Chống can nhiễu từ trường sóng vô tuyến", "department": "TECHNICAL", "slaDays": 3, "description": "Đo kiểm khả năng chống nhiễu từ đường ray thứ 3 điện áp 750V DC sang cáp tín hiệu", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 2}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["TECHNICAL_LEAD"]}}, {"id": "node-metro-sourcing", "type": "STAGE", "x": 820, "y": 240, "data": {"code": "STAGE_ATO_SOURCING", "title": "Sourcing Thiết Bị Lắp Trên Đoàn Tàu (On-board ATO)", "subtitle": "Chào giá từ Alstom, Siemens, Hitachi Rail", "department": "PROCUREMENT", "slaDays": 5, "description": "Lựa chọn ăng-ten thu nhận tín hiệu balise và bộ điều khiển phanh khẩn cấp tự động", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 4}, "layer2Financial": {"enabled": true, "maxBudget": 75000000000}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["PROCUREMENT_LEAD"]}}, {"id": "node-metro-gatekeeper", "type": "GATEKEEPER", "x": 1080, "y": 240, "data": {"code": "GATE_METRO_SAFETY", "title": "Gatekeeper Kiểm Định An Toàn Cục Đường Sắt", "subtitle": "Đạt 100% tiêu chí an toàn trước khi tích hợp", "department": "LEGAL", "slaDays": 2, "description": "Hồ sơ thẩm định phải có chữ ký của Tư vấn độc lập ISA (Independent Safety Assessor)", "gatekeeper": {"layer1DocChecklist": {"enabled": true, "docCount": 5}, "layer2Financial": {"enabled": true, "maxBudget": 80000000000}, "layer3Approval": {"enabled": true, "approvalMode": "ALL_PARALLEL"}, "layer4DistributedLock": {"enabled": true, "redissonLockKey": "lock:metro:cbtc:safety"}}, "assignedRoles": ["LEGAL_COUNSEL", "BID_MANAGER"]}}, {"id": "node-metro-approval", "type": "APPROVAL", "x": 1340, "y": 240, "data": {"code": "APPROVAL_METRO_BOARD", "title": "Phê Duyệt Ban Quản Lý Đường Sắt Đô Thị (MRB)", "subtitle": "Hội đồng nghiệm thu kỹ thuật phê duyệt", "department": "BOARD_OF_DIRECTORS", "slaDays": 2, "description": "Ký kết nghiệm thu bàn giao hồ sơ thiết kế kỹ thuật thi công và phương án chạy thử", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": true, "approvalMode": "ALL_PARALLEL"}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["CEO"]}}, {"id": "node-metro-webhook", "type": "WEBHOOK", "x": 1580, "y": 240, "data": {"code": "WEBHOOK_TRAIN_TEST", "title": "Kích Hoạt Kịch Bản Chạy Thử Liên Động (Trial Run)", "subtitle": "Gửi tín hiệu Webhook tới trung tâm điều hành OCC", "department": "TECHNICAL", "slaDays": 1, "description": "Lập lịch chạy thử 5.000 km không tải để kiểm tra tỷ lệ đúng giờ và khoảng cách dừng đỗ", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["TECHNICAL_LEAD"]}}, {"id": "node-metro-end", "type": "END", "x": 1820, "y": 240, "data": {"code": "END_METRO_COMMISSION", "title": "Nghiệm Thu Đưa Vào Vận Hành Thương Mại", "subtitle": "Bàn giao chìa khóa trao tay cho Hanoi Metro", "department": "BID_MANAGEMENT", "slaDays": 1, "description": "Cấp chứng chỉ nghiệm thu bàn giao tạm thời PAC và chuyển sang giai đoạn bảo hành 2 năm", "gatekeeper": {"layer1DocChecklist": {"enabled": false}, "layer2Financial": {"enabled": false}, "layer3Approval": {"enabled": false}, "layer4DistributedLock": {"enabled": false}}, "assignedRoles": ["BID_MANAGER"]}}]	[{"id": "e-metro-1", "sourceNodeId": "node-metro-start", "targetNodeId": "node-metro-rams", "label": "Khảo sát an toàn"}, {"id": "e-metro-2", "sourceNodeId": "node-metro-rams", "targetNodeId": "node-metro-emc", "label": "Đạt chuẩn SIL-4"}, {"id": "e-metro-3", "sourceNodeId": "node-metro-emc", "targetNodeId": "node-metro-sourcing", "label": "Đạt chống nhiễu EMC"}, {"id": "e-metro-4", "sourceNodeId": "node-metro-sourcing", "targetNodeId": "node-metro-gatekeeper", "label": "Chốt nhà thầu Alstom"}, {"id": "e-metro-5", "sourceNodeId": "node-metro-gatekeeper", "targetNodeId": "node-metro-approval", "label": "Tư vấn ISA chấp thuận", "color": "#10b981"}, {"id": "e-metro-6", "sourceNodeId": "node-metro-gatekeeper", "targetNodeId": "node-metro-rams", "label": "Yêu cầu kiểm tra lại RAMS", "color": "#ef4444"}, {"id": "e-metro-7", "sourceNodeId": "node-metro-approval", "targetNodeId": "node-metro-webhook", "label": "MRB thông qua"}, {"id": "e-metro-8", "sourceNodeId": "node-metro-webhook", "targetNodeId": "node-metro-end", "label": "Trial run 5000km thành công", "color": "#10b981"}]	t	REGULAR_PROCUREMENT	2026-09-01 16:23:53.513073+00	2026-09-02 05:27:57.111006+00	f
\.


--
-- Data for Name: workflow_stage_tasks; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.workflow_stage_tasks (id, tenant_id, stage_id, title, description, default_role, priority, due_days_offset, depends_on_task_id, is_blocking, auto_assign_to, sort_order, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: workflow_stages; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.workflow_stages (id, tenant_id, workflow_id, version_id, code, name, description, sequence, stage_type, color, icon, sla_days, sla_warning_days, sla_action, is_initial, is_terminal, terminal_type, allow_skip, allow_return, require_all_tasks, require_approval, approval_role, auto_assign_role, on_enter_webhook, on_exit_webhook, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: workflow_transitions; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.workflow_transitions (id, tenant_id, workflow_id, version_id, from_stage_id, to_stage_id, name, description, condition_type, condition_config, allowed_roles, requires_confirmation, requires_comment, check_documents, check_tasks, auto_actions, sort_order, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: workflow_versions; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.workflow_versions (id, tenant_id, workflow_id, version_number, version_label, status, change_log, published_at, published_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: workflows; Type: TABLE DATA; Schema: public; Owner: mibid_admin
--

COPY public.workflows (id, tenant_id, name, description, is_active, created_by, created_at, updated_at, definition_json, nodes_json, edges_json, is_template, template_category, template_id, tenant_name, version, is_deleted, updated_by) FROM stdin;
\.


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: app_menus app_menus_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.app_menus
    ADD CONSTRAINT app_menus_pkey PRIMARY KEY (id);


--
-- Name: doc_types doc_types_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.doc_types
    ADD CONSTRAINT doc_types_pkey PRIMARY KEY (id);


--
-- Name: document_audit_logs document_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.document_audit_logs
    ADD CONSTRAINT document_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: file_attachments file_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.file_attachments
    ADD CONSTRAINT file_attachments_pkey PRIMARY KEY (id);


--
-- Name: file_sync_logs file_sync_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.file_sync_logs
    ADD CONSTRAINT file_sync_logs_pkey PRIMARY KEY (id);


--
-- Name: idempotent_event_logs idempotent_event_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.idempotent_event_logs
    ADD CONSTRAINT idempotent_event_logs_pkey PRIMARY KEY (id);


--
-- Name: integration_endpoints integration_endpoints_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.integration_endpoints
    ADD CONSTRAINT integration_endpoints_pkey PRIMARY KEY (id);


--
-- Name: magic_links magic_links_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.magic_links
    ADD CONSTRAINT magic_links_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: outbox_events outbox_events_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.outbox_events
    ADD CONSTRAINT outbox_events_pkey PRIMARY KEY (id);


--
-- Name: partner_onboarding_requests partner_onboarding_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.partner_onboarding_requests
    ADD CONSTRAINT partner_onboarding_requests_pkey PRIMARY KEY (id);


--
-- Name: partner_support_tickets partner_support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.partner_support_tickets
    ADD CONSTRAINT partner_support_tickets_pkey PRIMARY KEY (id);


--
-- Name: plan_features plan_features_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.plan_features
    ADD CONSTRAINT plan_features_pkey PRIMARY KEY (plan_id, feature_code);


--
-- Name: project_checklist_status project_checklist_status_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_checklist_status
    ADD CONSTRAINT project_checklist_status_pkey PRIMARY KEY (id);


--
-- Name: project_comments project_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_comments
    ADD CONSTRAINT project_comments_pkey PRIMARY KEY (id);


--
-- Name: project_documents project_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_documents
    ADD CONSTRAINT project_documents_pkey PRIMARY KEY (id);


--
-- Name: project_members project_members_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_pkey PRIMARY KEY (id);


--
-- Name: project_tasks project_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT project_tasks_pkey PRIMARY KEY (id);


--
-- Name: project_transition_logs project_transition_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_transition_logs
    ADD CONSTRAINT project_transition_logs_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: quotation_line_items quotation_line_items_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.quotation_line_items
    ADD CONSTRAINT quotation_line_items_pkey PRIMARY KEY (id);


--
-- Name: quotations quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_pkey PRIMARY KEY (id);


--
-- Name: rfq_evaluation_criteria rfq_evaluation_criteria_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.rfq_evaluation_criteria
    ADD CONSTRAINT rfq_evaluation_criteria_pkey PRIMARY KEY (id);


--
-- Name: rfq_line_items rfq_line_items_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.rfq_line_items
    ADD CONSTRAINT rfq_line_items_pkey PRIMARY KEY (id);


--
-- Name: rfq_vendors rfq_vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.rfq_vendors
    ADD CONSTRAINT rfq_vendors_pkey PRIMARY KEY (id);


--
-- Name: rfqs rfqs_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.rfqs
    ADD CONSTRAINT rfqs_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, feature_code);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: saas_features saas_features_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.saas_features
    ADD CONSTRAINT saas_features_pkey PRIMARY KEY (code);


--
-- Name: saas_modules saas_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.saas_modules
    ADD CONSTRAINT saas_modules_pkey PRIMARY KEY (code);


--
-- Name: shipment_costs shipment_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.shipment_costs
    ADD CONSTRAINT shipment_costs_pkey PRIMARY KEY (id);


--
-- Name: shipment_milestones shipment_milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.shipment_milestones
    ADD CONSTRAINT shipment_milestones_pkey PRIMARY KEY (id);


--
-- Name: shipments shipments_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_pkey PRIMARY KEY (id);


--
-- Name: stage_checklist_items stage_checklist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.stage_checklist_items
    ADD CONSTRAINT stage_checklist_items_pkey PRIMARY KEY (id);


--
-- Name: stage_doc_rules stage_doc_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.stage_doc_rules
    ADD CONSTRAINT stage_doc_rules_pkey PRIMARY KEY (id);


--
-- Name: stage_notifications stage_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.stage_notifications
    ADD CONSTRAINT stage_notifications_pkey PRIMARY KEY (id);


--
-- Name: subscription_invoices subscription_invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.subscription_invoices
    ADD CONSTRAINT subscription_invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: subscription_invoices subscription_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.subscription_invoices
    ADD CONSTRAINT subscription_invoices_pkey PRIMARY KEY (id);


--
-- Name: subscription_notifications subscription_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.subscription_notifications
    ADD CONSTRAINT subscription_notifications_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: supplier_partners supplier_partners_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.supplier_partners
    ADD CONSTRAINT supplier_partners_pkey PRIMARY KEY (id);


--
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (config_key);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: tenant_menu_permissions tenant_menu_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.tenant_menu_permissions
    ADD CONSTRAINT tenant_menu_permissions_pkey PRIMARY KEY (id);


--
-- Name: tenant_subscriptions tenant_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.tenant_subscriptions
    ADD CONSTRAINT tenant_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: app_menus uq_app_menus_code; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.app_menus
    ADD CONSTRAINT uq_app_menus_code UNIQUE (code);


--
-- Name: doc_types uq_doc_types_name; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.doc_types
    ADD CONSTRAINT uq_doc_types_name UNIQUE (tenant_id, name);


--
-- Name: magic_links uq_ml_token; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.magic_links
    ADD CONSTRAINT uq_ml_token UNIQUE (tenant_id, token);


--
-- Name: project_checklist_status uq_pcs_proj_item; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_checklist_status
    ADD CONSTRAINT uq_pcs_proj_item UNIQUE (project_id, checklist_item_id);


--
-- Name: project_members uq_pm_project_user; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT uq_pm_project_user UNIQUE (tenant_id, project_id, user_id);


--
-- Name: projects uq_projects_code; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT uq_projects_code UNIQUE (tenant_id, project_code);


--
-- Name: quotation_line_items uq_qli_quot_item; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.quotation_line_items
    ADD CONSTRAINT uq_qli_quot_item UNIQUE (tenant_id, quotation_id, rfq_item_id);


--
-- Name: rfqs uq_rfqs_code; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.rfqs
    ADD CONSTRAINT uq_rfqs_code UNIQUE (tenant_id, rfq_code);


--
-- Name: roles uq_roles_name; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT uq_roles_name UNIQUE (tenant_id, name);


--
-- Name: rfq_vendors uq_rv_rfq_email; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.rfq_vendors
    ADD CONSTRAINT uq_rv_rfq_email UNIQUE (tenant_id, rfq_id, vendor_email);


--
-- Name: shipments uq_s_bl; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT uq_s_bl UNIQUE (tenant_id, bl_number);


--
-- Name: stage_doc_rules uq_sdr_stage_doc; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.stage_doc_rules
    ADD CONSTRAINT uq_sdr_stage_doc UNIQUE (tenant_id, stage_id, doc_type_id);


--
-- Name: system_settings uq_ss_key; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT uq_ss_key UNIQUE (tenant_id, setting_key);


--
-- Name: subscription_plans uq_sub_plans_code; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT uq_sub_plans_code UNIQUE (code);


--
-- Name: tenants uq_tenant_domain; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT uq_tenant_domain UNIQUE (domain);


--
-- Name: user_sessions uq_us_session; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT uq_us_session UNIQUE (tenant_id, session_token);


--
-- Name: users uq_users_email; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uq_users_email UNIQUE (tenant_id, email);


--
-- Name: workflow_stages uq_wfstages_code; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflow_stages
    ADD CONSTRAINT uq_wfstages_code UNIQUE (tenant_id, workflow_id, version_id, code);


--
-- Name: workflow_stages uq_wfstages_seq; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflow_stages
    ADD CONSTRAINT uq_wfstages_seq UNIQUE (tenant_id, workflow_id, version_id, sequence);


--
-- Name: workflow_transitions uq_wt_from_to; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflow_transitions
    ADD CONSTRAINT uq_wt_from_to UNIQUE (tenant_id, workflow_id, version_id, from_stage_id, to_stage_id);


--
-- Name: workflow_versions uq_wv_version; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflow_versions
    ADD CONSTRAINT uq_wv_version UNIQUE (tenant_id, workflow_id, version_number);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: workflow_definitions workflow_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflow_definitions
    ADD CONSTRAINT workflow_definitions_pkey PRIMARY KEY (id);


--
-- Name: workflow_stage_tasks workflow_stage_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflow_stage_tasks
    ADD CONSTRAINT workflow_stage_tasks_pkey PRIMARY KEY (id);


--
-- Name: workflow_stages workflow_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflow_stages
    ADD CONSTRAINT workflow_stages_pkey PRIMARY KEY (id);


--
-- Name: workflow_transitions workflow_transitions_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflow_transitions
    ADD CONSTRAINT workflow_transitions_pkey PRIMARY KEY (id);


--
-- Name: workflow_versions workflow_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflow_versions
    ADD CONSTRAINT workflow_versions_pkey PRIMARY KEY (id);


--
-- Name: workflows workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_pkey PRIMARY KEY (id);


--
-- Name: idx_al_created; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_al_created ON public.activity_logs USING btree (created_at DESC);


--
-- Name: idx_al_entity; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_al_entity ON public.activity_logs USING btree (entity_type, entity_id);


--
-- Name: idx_al_project; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_al_project ON public.activity_logs USING btree (project_id) WHERE (project_id IS NOT NULL);


--
-- Name: idx_al_session; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_al_session ON public.activity_logs USING btree (session_id) WHERE (session_id IS NOT NULL);


--
-- Name: idx_al_user; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_al_user ON public.activity_logs USING btree (user_id);


--
-- Name: idx_dal_created; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_dal_created ON public.document_audit_logs USING btree (created_at DESC);


--
-- Name: idx_dal_document; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_dal_document ON public.document_audit_logs USING btree (document_id);


--
-- Name: idx_fa_entity; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_fa_entity ON public.file_attachments USING btree (entity_type, entity_id);


--
-- Name: idx_mibid_app_menus_module; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_mibid_app_menus_module ON public.app_menus USING btree (module_code);


--
-- Name: idx_mibid_subs_invoices_tenant; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_mibid_subs_invoices_tenant ON public.subscription_invoices USING btree (tenant_id);


--
-- Name: idx_mibid_subs_notif_tenant; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_mibid_subs_notif_tenant ON public.subscription_notifications USING btree (tenant_id);


--
-- Name: idx_mibid_tenant_menu_perm_tenant; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_mibid_tenant_menu_perm_tenant ON public.tenant_menu_permissions USING btree (tenant_id);


--
-- Name: idx_mibid_tenant_subs_tenant; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_mibid_tenant_subs_tenant ON public.tenant_subscriptions USING btree (tenant_id);


--
-- Name: idx_ml_rfq; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_ml_rfq ON public.magic_links USING btree (rfq_id);


--
-- Name: idx_ml_status; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_ml_status ON public.magic_links USING btree (status);


--
-- Name: idx_ml_token; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_ml_token ON public.magic_links USING hash (token);


--
-- Name: idx_n_created; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_n_created ON public.notifications USING btree (created_at DESC);


--
-- Name: idx_n_group; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_n_group ON public.notifications USING btree (group_key) WHERE (group_key IS NOT NULL);


--
-- Name: idx_n_recipient; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_n_recipient ON public.notifications USING btree (recipient_id, is_read);


--
-- Name: idx_n_unread; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_n_unread ON public.notifications USING btree (recipient_id, created_at DESC) WHERE (is_read = false);


--
-- Name: idx_pc_created; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_pc_created ON public.project_comments USING btree (created_at DESC);


--
-- Name: idx_pc_project; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_pc_project ON public.project_comments USING btree (project_id);


--
-- Name: idx_pcs_project; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_pcs_project ON public.project_checklist_status USING btree (project_id);


--
-- Name: idx_pd_doc_type; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_pd_doc_type ON public.project_documents USING btree (doc_type_id);


--
-- Name: idx_pd_expiry; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_pd_expiry ON public.project_documents USING btree (expiry_date) WHERE (expiry_date IS NOT NULL);


--
-- Name: idx_pd_parent; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_pd_parent ON public.project_documents USING btree (parent_id) WHERE (parent_id IS NOT NULL);


--
-- Name: idx_pd_project; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_pd_project ON public.project_documents USING btree (project_id);


--
-- Name: idx_pd_status; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_pd_status ON public.project_documents USING btree (status);


--
-- Name: idx_pm_active; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_pm_active ON public.project_members USING btree (project_id) WHERE (removed_at IS NULL);


--
-- Name: idx_pm_project; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_pm_project ON public.project_members USING btree (project_id);


--
-- Name: idx_pm_user; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_pm_user ON public.project_members USING btree (user_id);


--
-- Name: idx_projects_stage; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_projects_stage ON public.projects USING btree (current_stage_id);


--
-- Name: idx_projects_status; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_projects_status ON public.projects USING btree (status);


--
-- Name: idx_projects_workflow; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_projects_workflow ON public.projects USING btree (workflow_id);


--
-- Name: idx_pt_assignee; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_pt_assignee ON public.project_tasks USING btree (assignee_id);


--
-- Name: idx_pt_due_date; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_pt_due_date ON public.project_tasks USING btree (due_date);


--
-- Name: idx_pt_overdue; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_pt_overdue ON public.project_tasks USING btree (due_date, status) WHERE ((status)::text <> ALL ((ARRAY['DONE'::character varying, 'CANCELLED'::character varying])::text[]));


--
-- Name: idx_pt_parent; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_pt_parent ON public.project_tasks USING btree (parent_id) WHERE (parent_id IS NOT NULL);


--
-- Name: idx_pt_project; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_pt_project ON public.project_tasks USING btree (project_id);


--
-- Name: idx_pt_status; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_pt_status ON public.project_tasks USING btree (status);


--
-- Name: idx_ptl_created; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_ptl_created ON public.project_transition_logs USING btree (created_at);


--
-- Name: idx_ptl_project; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_ptl_project ON public.project_transition_logs USING btree (project_id);


--
-- Name: idx_ptl_stages; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_ptl_stages ON public.project_transition_logs USING btree (from_stage_id, to_stage_id);


--
-- Name: idx_q_rank; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_q_rank ON public.quotations USING btree (rfq_id, comparison_rank) WHERE (comparison_rank IS NOT NULL);


--
-- Name: idx_q_rfq; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_q_rfq ON public.quotations USING btree (rfq_id);


--
-- Name: idx_q_status; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_q_status ON public.quotations USING btree (status);


--
-- Name: idx_q_vendor; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_q_vendor ON public.quotations USING btree (rfq_vendor_id);


--
-- Name: idx_qli_quotation; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_qli_quotation ON public.quotation_line_items USING btree (quotation_id);


--
-- Name: idx_qli_rfq_item; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_qli_rfq_item ON public.quotation_line_items USING btree (rfq_item_id);


--
-- Name: idx_rec_rfq; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_rec_rfq ON public.rfq_evaluation_criteria USING btree (rfq_id);


--
-- Name: idx_rfqs_deadline; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_rfqs_deadline ON public.rfqs USING btree (deadline);


--
-- Name: idx_rfqs_parent; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_rfqs_parent ON public.rfqs USING btree (parent_rfq_id) WHERE (parent_rfq_id IS NOT NULL);


--
-- Name: idx_rfqs_project; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_rfqs_project ON public.rfqs USING btree (project_id);


--
-- Name: idx_rfqs_status; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_rfqs_status ON public.rfqs USING btree (status);


--
-- Name: idx_rli_hs_code; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_rli_hs_code ON public.rfq_line_items USING btree (hs_code) WHERE (hs_code IS NOT NULL);


--
-- Name: idx_rli_rfq; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_rli_rfq ON public.rfq_line_items USING btree (rfq_id);


--
-- Name: idx_rv_invitation_code; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_rv_invitation_code ON public.rfq_vendors USING btree (invitation_code);


--
-- Name: idx_rv_rfq; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_rv_rfq ON public.rfq_vendors USING btree (rfq_id);


--
-- Name: idx_rv_status; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_rv_status ON public.rfq_vendors USING btree (status);


--
-- Name: idx_s_bl; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_s_bl ON public.shipments USING btree (bl_number) WHERE (bl_number IS NOT NULL);


--
-- Name: idx_s_booking; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_s_booking ON public.shipments USING btree (booking_number) WHERE (booking_number IS NOT NULL);


--
-- Name: idx_s_project; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_s_project ON public.shipments USING btree (project_id);


--
-- Name: idx_s_status; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_s_status ON public.shipments USING btree (status);


--
-- Name: idx_sc_shipment; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_sc_shipment ON public.shipment_costs USING btree (shipment_id);


--
-- Name: idx_sci_project_stage; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_sci_project_stage ON public.stage_checklist_items USING btree (project_id, stage_code);


--
-- Name: idx_sci_stage; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_sci_stage ON public.stage_checklist_items USING btree (stage_id);


--
-- Name: idx_sm_overdue; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_sm_overdue ON public.shipment_milestones USING btree (planned_date, is_completed) WHERE (is_completed = false);


--
-- Name: idx_sm_planned; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_sm_planned ON public.shipment_milestones USING btree (planned_date);


--
-- Name: idx_sm_shipment; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_sm_shipment ON public.shipment_milestones USING btree (shipment_id);


--
-- Name: idx_sn_stage; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_sn_stage ON public.stage_notifications USING btree (stage_id);


--
-- Name: idx_us_active; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_us_active ON public.user_sessions USING btree (user_id, is_active) WHERE (is_active = true);


--
-- Name: idx_us_token; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_us_token ON public.user_sessions USING hash (session_token);


--
-- Name: idx_us_user; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_us_user ON public.user_sessions USING btree (user_id);


--
-- Name: idx_users_department; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_users_department ON public.users USING btree (department);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_users_email ON public.users USING btree (tenant_id, email);


--
-- Name: idx_users_manager; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_users_manager ON public.users USING btree (direct_manager_id) WHERE (direct_manager_id IS NOT NULL);


--
-- Name: idx_users_role_id; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_users_role_id ON public.users USING btree (role_id);


--
-- Name: idx_wfstages_version; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_wfstages_version ON public.workflow_stages USING btree (version_id);


--
-- Name: idx_wfstages_workflow; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_wfstages_workflow ON public.workflow_stages USING btree (workflow_id);


--
-- Name: idx_wst_stage; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_wst_stage ON public.workflow_stage_tasks USING btree (stage_id);


--
-- Name: idx_wt_from; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_wt_from ON public.workflow_transitions USING btree (from_stage_id);


--
-- Name: idx_wt_to; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_wt_to ON public.workflow_transitions USING btree (to_stage_id);


--
-- Name: idx_wt_workflow; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_wt_workflow ON public.workflow_transitions USING btree (workflow_id);


--
-- Name: idx_wv_workflow; Type: INDEX; Schema: public; Owner: mibid_admin
--

CREATE INDEX idx_wv_workflow ON public.workflow_versions USING btree (workflow_id);


--
-- Name: doc_types trg_doc_types_updated_at; Type: TRIGGER; Schema: public; Owner: mibid_admin
--

CREATE TRIGGER trg_doc_types_updated_at BEFORE UPDATE ON public.doc_types FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();


--
-- Name: shipment_milestones trg_milestone_delay; Type: TRIGGER; Schema: public; Owner: mibid_admin
--

CREATE TRIGGER trg_milestone_delay BEFORE INSERT OR UPDATE ON public.shipment_milestones FOR EACH ROW EXECUTE FUNCTION public.fn_calc_delay_days();


--
-- Name: project_documents trg_project_documents_updated_at; Type: TRIGGER; Schema: public; Owner: mibid_admin
--

CREATE TRIGGER trg_project_documents_updated_at BEFORE UPDATE ON public.project_documents FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();


--
-- Name: project_tasks trg_project_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: mibid_admin
--

CREATE TRIGGER trg_project_tasks_updated_at BEFORE UPDATE ON public.project_tasks FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();


--
-- Name: projects trg_projects_updated_at; Type: TRIGGER; Schema: public; Owner: mibid_admin
--

CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();


--
-- Name: quotation_line_items trg_quotation_line_items_updated_at; Type: TRIGGER; Schema: public; Owner: mibid_admin
--

CREATE TRIGGER trg_quotation_line_items_updated_at BEFORE UPDATE ON public.quotation_line_items FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();


--
-- Name: quotations trg_quotations_updated_at; Type: TRIGGER; Schema: public; Owner: mibid_admin
--

CREATE TRIGGER trg_quotations_updated_at BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();


--
-- Name: rfq_line_items trg_rfq_line_items_updated_at; Type: TRIGGER; Schema: public; Owner: mibid_admin
--

CREATE TRIGGER trg_rfq_line_items_updated_at BEFORE UPDATE ON public.rfq_line_items FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();


--
-- Name: rfqs trg_rfqs_updated_at; Type: TRIGGER; Schema: public; Owner: mibid_admin
--

CREATE TRIGGER trg_rfqs_updated_at BEFORE UPDATE ON public.rfqs FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();


--
-- Name: roles trg_roles_updated_at; Type: TRIGGER; Schema: public; Owner: mibid_admin
--

CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();


--
-- Name: shipment_costs trg_shipment_costs_updated_at; Type: TRIGGER; Schema: public; Owner: mibid_admin
--

CREATE TRIGGER trg_shipment_costs_updated_at BEFORE UPDATE ON public.shipment_costs FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();


--
-- Name: shipment_milestones trg_shipment_milestones_updated_at; Type: TRIGGER; Schema: public; Owner: mibid_admin
--

CREATE TRIGGER trg_shipment_milestones_updated_at BEFORE UPDATE ON public.shipment_milestones FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();


--
-- Name: shipments trg_shipments_updated_at; Type: TRIGGER; Schema: public; Owner: mibid_admin
--

CREATE TRIGGER trg_shipments_updated_at BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();


--
-- Name: system_settings trg_system_settings_updated_at; Type: TRIGGER; Schema: public; Owner: mibid_admin
--

CREATE TRIGGER trg_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();


--
-- Name: tenant_subscriptions trg_tenant_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: mibid_admin
--

CREATE TRIGGER trg_tenant_subscriptions_updated_at BEFORE UPDATE ON public.tenant_subscriptions FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();


--
-- Name: tenants trg_tenants_updated_at; Type: TRIGGER; Schema: public; Owner: mibid_admin
--

CREATE TRIGGER trg_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();


--
-- Name: project_transition_logs trg_transition_duration; Type: TRIGGER; Schema: public; Owner: mibid_admin
--

CREATE TRIGGER trg_transition_duration BEFORE INSERT ON public.project_transition_logs FOR EACH ROW EXECUTE FUNCTION public.fn_calc_transition_duration();


--
-- Name: users trg_users_updated_at; Type: TRIGGER; Schema: public; Owner: mibid_admin
--

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();


--
-- Name: workflow_stages trg_workflow_stages_updated_at; Type: TRIGGER; Schema: public; Owner: mibid_admin
--

CREATE TRIGGER trg_workflow_stages_updated_at BEFORE UPDATE ON public.workflow_stages FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();


--
-- Name: workflow_versions trg_workflow_versions_updated_at; Type: TRIGGER; Schema: public; Owner: mibid_admin
--

CREATE TRIGGER trg_workflow_versions_updated_at BEFORE UPDATE ON public.workflow_versions FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();


--
-- Name: workflows trg_workflows_updated_at; Type: TRIGGER; Schema: public; Owner: mibid_admin
--

CREATE TRIGGER trg_workflows_updated_at BEFORE UPDATE ON public.workflows FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();


--
-- Name: activity_logs fk_al_project; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT fk_al_project FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: activity_logs fk_al_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT fk_al_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: activity_logs fk_al_user; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT fk_al_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: document_audit_logs fk_dal_doc; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.document_audit_logs
    ADD CONSTRAINT fk_dal_doc FOREIGN KEY (document_id) REFERENCES public.project_documents(id) ON DELETE CASCADE;


--
-- Name: document_audit_logs fk_dal_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.document_audit_logs
    ADD CONSTRAINT fk_dal_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: document_audit_logs fk_dal_user; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.document_audit_logs
    ADD CONSTRAINT fk_dal_user FOREIGN KEY (performed_by) REFERENCES public.users(id);


--
-- Name: doc_types fk_doc_types_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.doc_types
    ADD CONSTRAINT fk_doc_types_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: file_attachments fk_fa_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.file_attachments
    ADD CONSTRAINT fk_fa_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: file_attachments fk_fa_uploader; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.file_attachments
    ADD CONSTRAINT fk_fa_uploader FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: magic_links fk_ml_rfq; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.magic_links
    ADD CONSTRAINT fk_ml_rfq FOREIGN KEY (rfq_id) REFERENCES public.rfqs(id) ON DELETE CASCADE;


--
-- Name: magic_links fk_ml_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.magic_links
    ADD CONSTRAINT fk_ml_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: magic_links fk_ml_vendor; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.magic_links
    ADD CONSTRAINT fk_ml_vendor FOREIGN KEY (rfq_vendor_id) REFERENCES public.rfq_vendors(id);


--
-- Name: notifications fk_n_recipient; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_n_recipient FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications fk_n_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_n_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: project_comments fk_pc_author; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_comments
    ADD CONSTRAINT fk_pc_author FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: project_comments fk_pc_parent; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_comments
    ADD CONSTRAINT fk_pc_parent FOREIGN KEY (parent_id) REFERENCES public.project_comments(id);


--
-- Name: project_comments fk_pc_project; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_comments
    ADD CONSTRAINT fk_pc_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_comments fk_pc_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_comments
    ADD CONSTRAINT fk_pc_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: project_checklist_status fk_pcs_item; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_checklist_status
    ADD CONSTRAINT fk_pcs_item FOREIGN KEY (checklist_item_id) REFERENCES public.stage_checklist_items(id) ON DELETE CASCADE;


--
-- Name: project_checklist_status fk_pcs_project; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_checklist_status
    ADD CONSTRAINT fk_pcs_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_checklist_status fk_pcs_user; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_checklist_status
    ADD CONSTRAINT fk_pcs_user FOREIGN KEY (checked_by) REFERENCES public.users(id);


--
-- Name: project_documents fk_pd_doc_type; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_documents
    ADD CONSTRAINT fk_pd_doc_type FOREIGN KEY (doc_type_id) REFERENCES public.doc_types(id);


--
-- Name: project_documents fk_pd_parent; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_documents
    ADD CONSTRAINT fk_pd_parent FOREIGN KEY (parent_id) REFERENCES public.project_documents(id);


--
-- Name: project_documents fk_pd_project; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_documents
    ADD CONSTRAINT fk_pd_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_documents fk_pd_reviewer; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_documents
    ADD CONSTRAINT fk_pd_reviewer FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: project_documents fk_pd_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_documents
    ADD CONSTRAINT fk_pd_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: project_documents fk_pd_uploader; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_documents
    ADD CONSTRAINT fk_pd_uploader FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: plan_features fk_pf_feature; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.plan_features
    ADD CONSTRAINT fk_pf_feature FOREIGN KEY (feature_code) REFERENCES public.saas_features(code) ON DELETE CASCADE;


--
-- Name: project_members fk_pm_added_by; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT fk_pm_added_by FOREIGN KEY (added_by) REFERENCES public.users(id);


--
-- Name: project_members fk_pm_project; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT fk_pm_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_members fk_pm_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT fk_pm_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: project_members fk_pm_user; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT fk_pm_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: projects fk_projects_creator; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_projects_creator FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: projects fk_projects_stage; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_projects_stage FOREIGN KEY (current_stage_id) REFERENCES public.workflow_stages(id);


--
-- Name: projects fk_projects_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_projects_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: projects fk_projects_wf_version; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_projects_wf_version FOREIGN KEY (workflow_version_id) REFERENCES public.workflow_versions(id);


--
-- Name: projects fk_projects_workflow; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_projects_workflow FOREIGN KEY (workflow_id) REFERENCES public.workflow_definitions(id) ON DELETE SET NULL;


--
-- Name: project_tasks fk_pt_assignee; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT fk_pt_assignee FOREIGN KEY (assignee_id) REFERENCES public.users(id);


--
-- Name: project_tasks fk_pt_creator; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT fk_pt_creator FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: project_tasks fk_pt_parent; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT fk_pt_parent FOREIGN KEY (parent_id) REFERENCES public.project_tasks(id);


--
-- Name: project_tasks fk_pt_project; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT fk_pt_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_tasks fk_pt_reviewer; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT fk_pt_reviewer FOREIGN KEY (reviewer_id) REFERENCES public.users(id);


--
-- Name: project_tasks fk_pt_stage; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT fk_pt_stage FOREIGN KEY (stage_id) REFERENCES public.workflow_stages(id);


--
-- Name: project_tasks fk_pt_template; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT fk_pt_template FOREIGN KEY (source_template_id) REFERENCES public.workflow_stage_tasks(id);


--
-- Name: project_tasks fk_pt_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT fk_pt_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: project_transition_logs fk_ptl_from; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_transition_logs
    ADD CONSTRAINT fk_ptl_from FOREIGN KEY (from_stage_id) REFERENCES public.workflow_stages(id);


--
-- Name: project_transition_logs fk_ptl_project; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_transition_logs
    ADD CONSTRAINT fk_ptl_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_transition_logs fk_ptl_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_transition_logs
    ADD CONSTRAINT fk_ptl_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: project_transition_logs fk_ptl_to; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_transition_logs
    ADD CONSTRAINT fk_ptl_to FOREIGN KEY (to_stage_id) REFERENCES public.workflow_stages(id);


--
-- Name: project_transition_logs fk_ptl_transition; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_transition_logs
    ADD CONSTRAINT fk_ptl_transition FOREIGN KEY (transition_id) REFERENCES public.workflow_transitions(id);


--
-- Name: project_transition_logs fk_ptl_user; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.project_transition_logs
    ADD CONSTRAINT fk_ptl_user FOREIGN KEY (transitioned_by) REFERENCES public.users(id);


--
-- Name: quotations fk_q_approver; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT fk_q_approver FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: quotations fk_q_magic_link; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT fk_q_magic_link FOREIGN KEY (magic_link_id) REFERENCES public.magic_links(id);


--
-- Name: quotations fk_q_rfq; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT fk_q_rfq FOREIGN KEY (rfq_id) REFERENCES public.rfqs(id) ON DELETE CASCADE;


--
-- Name: quotations fk_q_rfq_vendor; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT fk_q_rfq_vendor FOREIGN KEY (rfq_vendor_id) REFERENCES public.rfq_vendors(id);


--
-- Name: quotations fk_q_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT fk_q_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: quotation_line_items fk_qli_quotation; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.quotation_line_items
    ADD CONSTRAINT fk_qli_quotation FOREIGN KEY (quotation_id) REFERENCES public.quotations(id) ON DELETE CASCADE;


--
-- Name: quotation_line_items fk_qli_rfq_item; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.quotation_line_items
    ADD CONSTRAINT fk_qli_rfq_item FOREIGN KEY (rfq_item_id) REFERENCES public.rfq_line_items(id) ON DELETE CASCADE;


--
-- Name: quotation_line_items fk_qli_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.quotation_line_items
    ADD CONSTRAINT fk_qli_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: rfq_evaluation_criteria fk_rec_rfq; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.rfq_evaluation_criteria
    ADD CONSTRAINT fk_rec_rfq FOREIGN KEY (rfq_id) REFERENCES public.rfqs(id) ON DELETE CASCADE;


--
-- Name: rfq_evaluation_criteria fk_rec_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.rfq_evaluation_criteria
    ADD CONSTRAINT fk_rec_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: rfqs fk_rfqs_approver; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.rfqs
    ADD CONSTRAINT fk_rfqs_approver FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: rfqs fk_rfqs_creator; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.rfqs
    ADD CONSTRAINT fk_rfqs_creator FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: rfqs fk_rfqs_parent; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.rfqs
    ADD CONSTRAINT fk_rfqs_parent FOREIGN KEY (parent_rfq_id) REFERENCES public.rfqs(id);


--
-- Name: rfqs fk_rfqs_project; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.rfqs
    ADD CONSTRAINT fk_rfqs_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: rfqs fk_rfqs_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.rfqs
    ADD CONSTRAINT fk_rfqs_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: rfq_line_items fk_rli_rfq; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.rfq_line_items
    ADD CONSTRAINT fk_rli_rfq FOREIGN KEY (rfq_id) REFERENCES public.rfqs(id) ON DELETE CASCADE;


--
-- Name: rfq_line_items fk_rli_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.rfq_line_items
    ADD CONSTRAINT fk_rli_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: roles fk_roles_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT fk_roles_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: role_permissions fk_rp_role; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: rfq_vendors fk_rv_rfq; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.rfq_vendors
    ADD CONSTRAINT fk_rv_rfq FOREIGN KEY (rfq_id) REFERENCES public.rfqs(id) ON DELETE CASCADE;


--
-- Name: rfq_vendors fk_rv_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.rfq_vendors
    ADD CONSTRAINT fk_rv_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: shipments fk_s_assignee; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT fk_s_assignee FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: shipments fk_s_creator; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT fk_s_creator FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: shipments fk_s_project; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT fk_s_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: shipments fk_s_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT fk_s_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: shipment_costs fk_sc_creator; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.shipment_costs
    ADD CONSTRAINT fk_sc_creator FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: shipment_costs fk_sc_shipment; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.shipment_costs
    ADD CONSTRAINT fk_sc_shipment FOREIGN KEY (shipment_id) REFERENCES public.shipments(id) ON DELETE CASCADE;


--
-- Name: shipment_costs fk_sc_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.shipment_costs
    ADD CONSTRAINT fk_sc_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: stage_checklist_items fk_sci_stage; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.stage_checklist_items
    ADD CONSTRAINT fk_sci_stage FOREIGN KEY (stage_id) REFERENCES public.workflow_stages(id) ON DELETE CASCADE;


--
-- Name: stage_checklist_items fk_sci_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.stage_checklist_items
    ADD CONSTRAINT fk_sci_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: stage_doc_rules fk_sdr_doc_type; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.stage_doc_rules
    ADD CONSTRAINT fk_sdr_doc_type FOREIGN KEY (doc_type_id) REFERENCES public.doc_types(id) ON DELETE CASCADE;


--
-- Name: stage_doc_rules fk_sdr_stage; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.stage_doc_rules
    ADD CONSTRAINT fk_sdr_stage FOREIGN KEY (stage_id) REFERENCES public.workflow_stages(id) ON DELETE CASCADE;


--
-- Name: stage_doc_rules fk_sdr_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.stage_doc_rules
    ADD CONSTRAINT fk_sdr_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: saas_features fk_sf_module; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.saas_features
    ADD CONSTRAINT fk_sf_module FOREIGN KEY (module_code) REFERENCES public.saas_modules(code) ON DELETE CASCADE;


--
-- Name: shipment_milestones fk_sm_completer; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.shipment_milestones
    ADD CONSTRAINT fk_sm_completer FOREIGN KEY (completed_by) REFERENCES public.users(id);


--
-- Name: shipment_milestones fk_sm_shipment; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.shipment_milestones
    ADD CONSTRAINT fk_sm_shipment FOREIGN KEY (shipment_id) REFERENCES public.shipments(id) ON DELETE CASCADE;


--
-- Name: shipment_milestones fk_sm_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.shipment_milestones
    ADD CONSTRAINT fk_sm_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: shipment_milestones fk_sm_updater; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.shipment_milestones
    ADD CONSTRAINT fk_sm_updater FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: stage_notifications fk_sn_stage; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.stage_notifications
    ADD CONSTRAINT fk_sn_stage FOREIGN KEY (stage_id) REFERENCES public.workflow_stages(id) ON DELETE CASCADE;


--
-- Name: stage_notifications fk_sn_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.stage_notifications
    ADD CONSTRAINT fk_sn_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: system_settings fk_ss_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT fk_ss_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: system_settings fk_ss_updater; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT fk_ss_updater FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: tenant_subscriptions fk_ts_plan; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.tenant_subscriptions
    ADD CONSTRAINT fk_ts_plan FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id) ON DELETE CASCADE;


--
-- Name: user_sessions fk_us_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT fk_us_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: user_sessions fk_us_user; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT fk_us_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users fk_users_manager; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_manager FOREIGN KEY (direct_manager_id) REFERENCES public.users(id);


--
-- Name: users fk_users_role; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: users fk_users_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: workflow_stages fk_wfstages_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflow_stages
    ADD CONSTRAINT fk_wfstages_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: workflow_stages fk_wfstages_version; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflow_stages
    ADD CONSTRAINT fk_wfstages_version FOREIGN KEY (version_id) REFERENCES public.workflow_versions(id);


--
-- Name: workflow_stages fk_wfstages_workflow; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflow_stages
    ADD CONSTRAINT fk_wfstages_workflow FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE CASCADE;


--
-- Name: workflows fk_workflows_creator; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT fk_workflows_creator FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: workflows fk_workflows_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT fk_workflows_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: workflow_stage_tasks fk_wst_depends; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflow_stage_tasks
    ADD CONSTRAINT fk_wst_depends FOREIGN KEY (depends_on_task_id) REFERENCES public.workflow_stage_tasks(id);


--
-- Name: workflow_stage_tasks fk_wst_stage; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflow_stage_tasks
    ADD CONSTRAINT fk_wst_stage FOREIGN KEY (stage_id) REFERENCES public.workflow_stages(id) ON DELETE CASCADE;


--
-- Name: workflow_stage_tasks fk_wst_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflow_stage_tasks
    ADD CONSTRAINT fk_wst_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: workflow_transitions fk_wt_from; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflow_transitions
    ADD CONSTRAINT fk_wt_from FOREIGN KEY (from_stage_id) REFERENCES public.workflow_stages(id) ON DELETE CASCADE;


--
-- Name: workflow_transitions fk_wt_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflow_transitions
    ADD CONSTRAINT fk_wt_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: workflow_transitions fk_wt_to; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflow_transitions
    ADD CONSTRAINT fk_wt_to FOREIGN KEY (to_stage_id) REFERENCES public.workflow_stages(id) ON DELETE CASCADE;


--
-- Name: workflow_transitions fk_wt_version; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflow_transitions
    ADD CONSTRAINT fk_wt_version FOREIGN KEY (version_id) REFERENCES public.workflow_versions(id);


--
-- Name: workflow_transitions fk_wt_workflow; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflow_transitions
    ADD CONSTRAINT fk_wt_workflow FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE CASCADE;


--
-- Name: workflow_versions fk_wv_publisher; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflow_versions
    ADD CONSTRAINT fk_wv_publisher FOREIGN KEY (published_by) REFERENCES public.users(id);


--
-- Name: workflow_versions fk_wv_tenant; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflow_versions
    ADD CONSTRAINT fk_wv_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: workflow_versions fk_wv_workflow; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.workflow_versions
    ADD CONSTRAINT fk_wv_workflow FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE CASCADE;


--
-- Name: stage_checklist_items stage_checklist_items_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mibid_admin
--

ALTER TABLE ONLY public.stage_checklist_items
    ADD CONSTRAINT stage_checklist_items_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: activity_logs; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: doc_types; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.doc_types ENABLE ROW LEVEL SECURITY;

--
-- Name: document_audit_logs; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.document_audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: file_attachments; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.file_attachments ENABLE ROW LEVEL SECURITY;

--
-- Name: magic_links; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.magic_links ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: project_checklist_status; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.project_checklist_status ENABLE ROW LEVEL SECURITY;

--
-- Name: project_comments; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;

--
-- Name: project_documents; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: project_members; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

--
-- Name: project_tasks; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: project_transition_logs; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.project_transition_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: projects; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

--
-- Name: quotation_line_items; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.quotation_line_items ENABLE ROW LEVEL SECURITY;

--
-- Name: quotations; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

--
-- Name: rfq_evaluation_criteria; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.rfq_evaluation_criteria ENABLE ROW LEVEL SECURITY;

--
-- Name: rfq_line_items; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.rfq_line_items ENABLE ROW LEVEL SECURITY;

--
-- Name: rfq_vendors; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.rfq_vendors ENABLE ROW LEVEL SECURITY;

--
-- Name: rfqs; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;

--
-- Name: roles; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

--
-- Name: shipment_costs; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.shipment_costs ENABLE ROW LEVEL SECURITY;

--
-- Name: shipment_milestones; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.shipment_milestones ENABLE ROW LEVEL SECURITY;

--
-- Name: shipments; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

--
-- Name: stage_checklist_items; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.stage_checklist_items ENABLE ROW LEVEL SECURITY;

--
-- Name: stage_doc_rules; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.stage_doc_rules ENABLE ROW LEVEL SECURITY;

--
-- Name: stage_notifications; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.stage_notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: system_settings; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: activity_logs tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.activity_logs USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: doc_types tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.doc_types USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: document_audit_logs tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.document_audit_logs USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: file_attachments tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.file_attachments USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: magic_links tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.magic_links USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: notifications tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.notifications USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: project_checklist_status tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.project_checklist_status USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: project_comments tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.project_comments USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: project_documents tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.project_documents USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: project_members tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.project_members USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: project_tasks tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.project_tasks USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: project_transition_logs tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.project_transition_logs USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: projects tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.projects USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: quotation_line_items tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.quotation_line_items USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: quotations tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.quotations USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: rfq_evaluation_criteria tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.rfq_evaluation_criteria USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: rfq_line_items tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.rfq_line_items USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: rfq_vendors tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.rfq_vendors USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: rfqs tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.rfqs USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: roles tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.roles USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: shipment_costs tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.shipment_costs USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: shipment_milestones tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.shipment_milestones USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: shipments tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.shipments USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: stage_checklist_items tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.stage_checklist_items USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: stage_doc_rules tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.stage_doc_rules USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: stage_notifications tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.stage_notifications USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: system_settings tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.system_settings USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: user_sessions tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.user_sessions USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: users tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.users USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: workflow_stage_tasks tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.workflow_stage_tasks USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: workflow_stages tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.workflow_stages USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: workflow_transitions tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.workflow_transitions USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: workflow_versions tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.workflow_versions USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: workflows tenant_isolation_policy; Type: POLICY; Schema: public; Owner: mibid_admin
--

CREATE POLICY tenant_isolation_policy ON public.workflows USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::uuid));


--
-- Name: user_sessions; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: workflow_stage_tasks; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.workflow_stage_tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: workflow_stages; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.workflow_stages ENABLE ROW LEVEL SECURITY;

--
-- Name: workflow_transitions; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.workflow_transitions ENABLE ROW LEVEL SECURITY;

--
-- Name: workflow_versions; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.workflow_versions ENABLE ROW LEVEL SECURITY;

--
-- Name: workflows; Type: ROW SECURITY; Schema: public; Owner: mibid_admin
--

ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

--
-- Name: TABLE activity_logs; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.activity_logs TO mibid_user;


--
-- Name: TABLE app_menus; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.app_menus TO mibid_user;


--
-- Name: TABLE doc_types; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.doc_types TO mibid_user;


--
-- Name: TABLE document_audit_logs; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.document_audit_logs TO mibid_user;


--
-- Name: TABLE documents; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.documents TO mibid_user;


--
-- Name: TABLE file_attachments; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.file_attachments TO mibid_user;


--
-- Name: TABLE file_sync_logs; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.file_sync_logs TO mibid_user;


--
-- Name: TABLE idempotent_event_logs; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.idempotent_event_logs TO mibid_user;


--
-- Name: TABLE integration_endpoints; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.integration_endpoints TO mibid_user;


--
-- Name: TABLE magic_links; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.magic_links TO mibid_user;


--
-- Name: TABLE notifications; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.notifications TO mibid_user;


--
-- Name: TABLE outbox_events; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.outbox_events TO mibid_user;


--
-- Name: TABLE partner_onboarding_requests; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.partner_onboarding_requests TO mibid_user;


--
-- Name: TABLE partner_support_tickets; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.partner_support_tickets TO mibid_user;


--
-- Name: TABLE plan_features; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.plan_features TO mibid_user;


--
-- Name: TABLE project_checklist_status; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.project_checklist_status TO mibid_user;


--
-- Name: TABLE project_comments; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.project_comments TO mibid_user;


--
-- Name: TABLE project_documents; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.project_documents TO mibid_user;


--
-- Name: TABLE project_members; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.project_members TO mibid_user;


--
-- Name: TABLE project_tasks; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.project_tasks TO mibid_user;


--
-- Name: TABLE project_transition_logs; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.project_transition_logs TO mibid_user;


--
-- Name: TABLE projects; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.projects TO mibid_user;


--
-- Name: TABLE quotation_line_items; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.quotation_line_items TO mibid_user;


--
-- Name: TABLE quotations; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.quotations TO mibid_user;


--
-- Name: TABLE rfq_evaluation_criteria; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.rfq_evaluation_criteria TO mibid_user;


--
-- Name: TABLE rfq_line_items; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.rfq_line_items TO mibid_user;


--
-- Name: TABLE rfq_vendors; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.rfq_vendors TO mibid_user;


--
-- Name: TABLE rfqs; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.rfqs TO mibid_user;


--
-- Name: TABLE role_permissions; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.role_permissions TO mibid_user;


--
-- Name: TABLE roles; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.roles TO mibid_user;


--
-- Name: TABLE saas_features; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.saas_features TO mibid_user;


--
-- Name: TABLE saas_modules; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.saas_modules TO mibid_user;


--
-- Name: TABLE shipment_costs; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.shipment_costs TO mibid_user;


--
-- Name: TABLE shipment_milestones; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.shipment_milestones TO mibid_user;


--
-- Name: TABLE shipments; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.shipments TO mibid_user;


--
-- Name: TABLE stage_checklist_items; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.stage_checklist_items TO mibid_user;


--
-- Name: TABLE stage_doc_rules; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.stage_doc_rules TO mibid_user;


--
-- Name: TABLE stage_notifications; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.stage_notifications TO mibid_user;


--
-- Name: TABLE subscription_plans; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.subscription_plans TO mibid_user;


--
-- Name: TABLE supplier_partners; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.supplier_partners TO mibid_user;


--
-- Name: TABLE system_settings; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.system_settings TO mibid_user;


--
-- Name: TABLE tasks; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.tasks TO mibid_user;


--
-- Name: TABLE tenant_menu_permissions; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.tenant_menu_permissions TO mibid_user;


--
-- Name: TABLE tenant_subscriptions; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.tenant_subscriptions TO mibid_user;


--
-- Name: TABLE tenants; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.tenants TO mibid_user;


--
-- Name: TABLE user_sessions; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.user_sessions TO mibid_user;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.users TO mibid_user;


--
-- Name: TABLE v_overdue_milestones; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.v_overdue_milestones TO mibid_user;


--
-- Name: TABLE workflow_stages; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.workflow_stages TO mibid_user;


--
-- Name: TABLE v_project_sla_status; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.v_project_sla_status TO mibid_user;


--
-- Name: TABLE workflow_definitions; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.workflow_definitions TO mibid_user;


--
-- Name: TABLE workflow_stage_tasks; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.workflow_stage_tasks TO mibid_user;


--
-- Name: TABLE workflow_transitions; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.workflow_transitions TO mibid_user;


--
-- Name: TABLE workflow_versions; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.workflow_versions TO mibid_user;


--
-- Name: TABLE workflows; Type: ACL; Schema: public; Owner: mibid_admin
--

GRANT ALL ON TABLE public.workflows TO mibid_user;


--
-- PostgreSQL database dump complete
--

\unrestrict vS4fA8ZhBWHX58CAW7ezdxaTd44cQ67EKDh2u2pW1ggcAshYhEbCgxLPtzCagdj

