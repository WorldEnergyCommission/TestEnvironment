package permission

import (
	"database/sql"
	"fmt"

	"github.com/eneries/eneries/api/pkg/utils"
)

const (
	listPermissionsQuery = `SELECT  id, description, "group", 
	CASE 
		WHEN scope_column IS NOT NULL THEN false ELSE true 
		END AS scopeless 
	FROM public."permission" 
	WHERE "group" IS NOT NULL`

	listPermissionDependeciesQuery = `
	WITH RECURSIVE DependentPermissions AS (
		SELECT pd."permission", pd.dependent_on
		FROM permission_dependency pd 
		WHERE "permission" = $1
		
		UNION ALL
		
		SELECT pdd."permission", pdd.dependent_on
		FROM permission_dependency pdd
		JOIN DependentPermissions d ON pdd."permission" = d.dependent_on
	)
	
	SELECT DISTINCT dependent_on
	FROM DependentPermissions; `

	listGroupsQuery = `SELECT distinct "group" FROM public."permission" WHERE "group" IS NOT NULL and can_be_added is true`

	caseWhenScopeBase = `
	CASE 
		WHEN rs.wildcard = true 			THEN '*' 
		WHEN rs.collection_id IS NOT NULL 	THEN cast(col."name" as varchar)
		WHEN rs.device_id IS NOT NULL 		THEN pd."name"
		WHEN rs.document_id IS NOT NULL 	THEN doc."name"
		WHEN rs.rule_id IS NOT NULL 		THEN rul."name"
		WHEN rs.invoice_id IS NOT NULL 		THEN cast(rs.invoice_id as varchar)
		WHEN rs.report_id IS NOT NULL 		THEN pr."name"
		WHEN rs.model_id IS NOT NULL 		THEN m.r->>'name'
		WHEN rs.data_mapping_id IS NOT NULL THEN datamapping."name"
		WHEN rs.module_id IS NOT NULL 		THEN modules."name"
		`
	caseWhenScopeEnd         = "ELSE '-' END AS scope "
	caseWhenUserScopeQuery   = caseWhenScopeBase + " WHEN rs.user_id IS NOT NULL 	THEN cast(rs.user_id as varchar) " + caseWhenScopeEnd
	caseWhenMemberScopeQuery = caseWhenScopeBase + " WHEN rs.member_id IS NOT NULL 	THEN cast(rs.member_id as varchar) " + caseWhenScopeEnd

	caseWhenScopeRefBase = `
	CASE
		WHEN rs.collection_id IS NOT NULL 		THEN cast(rs.collection_id as varchar) 
		WHEN rs.device_id IS NOT NULL 			THEN cast(rs.device_id as varchar)
		WHEN rs.document_id IS NOT NULL 		THEN cast(rs.document_id as varchar) 
		WHEN rs.rule_id IS NOT NULL 			THEN cast(rs.rule_id as varchar) 
		WHEN rs.invoice_id IS NOT NULL 			THEN cast(rs.invoice_id as varchar) 
		WHEN rs.report_id IS NOT NULL 			THEN cast(rs.report_id as varchar) 
		WHEN rs.model_id IS NOT NULL 			THEN cast(rs.model_id as varchar)
		WHEN rs.data_mapping_id IS NOT NULL 	THEN cast(rs.data_mapping_id as varchar)
		WHEN rs.module_id IS NOT NULL 			THEN cast(rs.module_id as varchar)`
	caseWhenScopeRefEnd         = "ELSE '*' END AS scope_reference "
	caseWhenUserScopeRefQuery   = caseWhenScopeRefBase + " WHEN rs.user_id IS NOT NULL 	THEN cast(rs.user_id as varchar) " + caseWhenScopeRefEnd
	caseWhenMemberScopeRefQuery = caseWhenScopeRefBase + " WHEN rs.member_id IS NOT NULL 	THEN cast(rs.member_id as varchar) " + caseWhenScopeRefEnd

	leftJoinScopeTables = `	
	LEFT JOIN public.project_device pd 					ON rs.device_id = pd.id
	LEFT JOIN public.project_document doc 				ON rs.document_id = doc.id
	LEFT JOIN public.project_report pr 					ON rs.report_id = pr.id
	LEFT JOIN public.project_rule rul 					ON rs.rule_id = rul.id
	LEFT JOIN public.models m 							ON rs.model_id = m.id
	LEFT JOIN public.project_collection col 			ON rs.collection_id = col.id 
	LEFT JOIN public.modules modules 					ON rs.module_id = modules.id 
	LEFT JOIN public.project_data_mapping datamapping 	ON rs.data_mapping_id = datamapping.id `

	listAdditionalPermissionsForMemberQuery = "SELECT apr.permission_id," + caseWhenUserScopeQuery + ", rs.id as scope_id," + caseWhenUserScopeRefQuery +
		`FROM public.additional_project_permissions apr 
		JOIN public.permission_scope rs ON apr.scope_id = rs.id ` +
		leftJoinScopeTables +
		"WHERE apr.project_id = cast( $1 as uuid) AND apr.user_id = cast( $2 as uuid)"

	listRolePermissonForMemberQuery = "SELECT DISTINCT  r.id as permission_id," + caseWhenUserScopeQuery +
		`FROM public.user u  
		JOIN public.project_user_role project_user      			ON project_user.user_id = u.id
		JOIN public."role" "role"                       			ON "role".id =  project_user.role_id 
		JOIN public.role_permission_group role_permission_group   	ON role_permission_group.role_id = "role".id
		JOIN public.permission_group rg                      		ON rg.id = role_permission_group.permission_group_id
		JOIN public.permission_group_permissions rgrs             	ON rgrs.permission_group_id =  rg.id
		JOIN public.permission_scope rs                  			ON rs.id = rgrs.scope_id
		JOIN public."permission" r                         			ON r.id = rgrs.permission_id ` +
		leftJoinScopeTables +
		"WHERE project_user.project_id = cast( $1 as uuid) AND u.id = cast( $2 as uuid)"

	listPossibleScopesForPermissionAndProjectQuery = `SELECT id, name FROM list_possible_scopes($2, $1)`
	createProjectPermissionForUser                 = `CALL create_user_project_permission($1, $2, $3, $4, $5)`
	deleteAdditionalPermissionForuser              = `delete from public.permission_scope WHERE id = cast($1 as uuid)`

	findAdditionalPermissionForUser = "SELECT rs.id as scope_id,apr.permission_id," + caseWhenUserScopeQuery +
		`FROM public.additional_project_permissions apr 
		JOIN public.permission_scope rs ON apr.scope_id = rs.id ` +
		leftJoinScopeTables +
		`WHERE apr.project_id = cast($1 as uuid)
		AND apr.user_id = cast($2 as uuid)
		AND apr.permission_id = $3
		AND rs.id = cast($4 as uuid)`

	listPlatformPermissionForUser = "SELECT permission_id," +
		caseWhenMemberScopeQuery +
		",scope_id," +
		caseWhenUserScopeRefQuery +
		`FROM public.general_permissions_for_user rs` +
		leftJoinScopeTables +
		` WHERE user_id = $1`

	selectUserRoleQuery = "SELECT role_id FROM user_role WHERE user_id = $1"
	insertUserQuery     = `insert into "user" values ($1);`
	insertUserRoleQuery = `insert into user_role values ($1, 'regularUser', $2);`
)

type (
	Repository struct {
		Database *sql.DB
	}
	Permission struct {
		ID             string   `json:"id"`
		Scope          string   `json:"scope,omitempty"`
		WithoutScope   bool     `json:"without_scope,omitempty"`
		Group          string   `json:"group,omitempty"`
		ScopeID        string   `json:"scope_id,omitempty"`
		ScopeReference string   `json:"scope_reference,omitempty"`
		DependentOn    []string `json:"dependent_on,omitempty"`
	}
	PossibleScope struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	}
)

func (r Repository) ListPermissions() ([]Permission, error) {
	rows, sqlErr := r.Database.Query(listPermissionsQuery)
	if sqlErr != nil && sqlErr != sql.ErrNoRows {
		return nil, sqlErr
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	permissions := make([]Permission, 0)

	var (
		id          string
		description string
		group       string
		scopeless   bool
	)
	for rows.Next() {
		if err := rows.Scan(&id, &description, &group, &scopeless); err != nil {
			return nil, err
		}

		permission := Permission{ID: id, Group: group, WithoutScope: scopeless}

		dependencies, err_d := r.ListDependenciesForPermission(id)

		if err_d == nil && len(dependencies) > 0 {
			permission.DependentOn = dependencies
		}

		permissions = append(permissions, permission)
	}

	return permissions, nil
}

func (r Repository) ListDependenciesForPermission(permission string) ([]string, error) {
	rows, sqlErr := r.Database.Query(listPermissionDependeciesQuery, permission)
	if sqlErr != nil && sqlErr != sql.ErrNoRows {
		return nil, sqlErr
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	dependencies := make([]string, 0)

	var value string

	for rows.Next() {
		err := rows.Scan(&value)
		if err != nil {
			return nil, err
		}
		dependencies = append(dependencies, value)
	}

	return dependencies, nil
}

func (r Repository) ListGroups() ([]string, error) {
	rows, sqlErr := r.Database.Query(listGroupsQuery)
	if sqlErr != nil && sqlErr != sql.ErrNoRows {
		return nil, sqlErr
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	groups := make([]string, 0)

	var group string

	for rows.Next() {
		if err := rows.Scan(&group); err != nil {
			return nil, err
		}

		groups = append(groups, group)
	}

	return groups, nil
}

func (r Repository) queryPermissionForMember(query, project_id, user_id string, with_scope_id bool) ([]Permission, error) {
	rows, sqlErr := r.Database.Query(query, project_id, user_id)
	if sqlErr != nil && sqlErr != sql.ErrNoRows {
		return nil, sqlErr
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	return r.scanPermissionsForMember(with_scope_id, rows)
}

func (r Repository) scanPermissionsForMember(with_scope_id bool, rows *sql.Rows) ([]Permission, error) {
	permissions := make([]Permission, 0)

	var (
		id              string
		scope_id        string
		scope           string
		scope_reference string
	)

	argsToScan := make([]any, 0)
	argsToScan = append(argsToScan, &id, &scope)
	if with_scope_id {
		argsToScan = append(argsToScan, &scope_id, &scope_reference)
	}
	for rows.Next() {
		if err := rows.Scan(argsToScan...); err != nil {
			return nil, err
		}

		permissions = append(permissions, Permission{ID: id, Scope: scope, ScopeID: scope_id, ScopeReference: scope_reference})
	}
	return permissions, nil
}

func (r Repository) ListPlatformPermissionForUser(user_id, realm string) ([]Permission, error) {
	user_rows, user_sqlErr := r.Database.Query(selectUserRoleQuery, user_id)
	if user_sqlErr != nil {
		return nil, user_sqlErr
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(user_rows)

	if !user_rows.Next() {
		createdErr := r.CreateUserIfNotExists(user_id, realm)
		if createdErr == nil {
			return r.ListPlatformPermissionForUser(user_id, realm)
		} else {
			return nil, createdErr
		}
	}

	rows, sqlErr := r.Database.Query(listPlatformPermissionForUser, user_id)
	if sqlErr != nil {
		return nil, sqlErr
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	return r.scanPermissionsForMember(true, rows)
}

func (r Repository) CreateUserIfNotExists(user_id string, realm string) error {
	rows, sqlErr := r.Database.Query(selectUserRoleQuery, user_id)
	if sqlErr != nil {
		return sqlErr
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	if !rows.Next() && realm != "" {
		_, sqlErr := r.Database.Exec(insertUserQuery, user_id)
		if sqlErr != nil {
			return sqlErr
		}

		_, sqlErr = r.Database.Exec(insertUserRoleQuery, user_id, realm)
		if sqlErr != nil {
			return sqlErr
		}

	}

	return nil
}

func (r Repository) ListAdditionalPermissionsForMember(project_id, userID string) ([]Permission, error) {
	return r.queryPermissionForMember(listAdditionalPermissionsForMemberQuery, project_id, userID, true)
}

func (r Repository) ListRolePermissonForMemberQuery(project_id, userID string) ([]Permission, error) {
	return r.queryPermissionForMember(listRolePermissonForMemberQuery, project_id, userID, false)
}

func (r Repository) ListPermissionsForMember(project_id, user_id string) ([]Permission, error) {
	added_permissions, err := r.ListAdditionalPermissionsForMember(project_id, user_id)
	if err != nil {
		return nil, err
	}
	role_permissions, err := r.ListRolePermissonForMemberQuery(project_id, user_id)
	if err != nil {
		return nil, err
	}

	platform_permission, err := r.ListPlatformPermissionForUser(user_id, "")
	if err != nil {
		return nil, err
	}

	permissions := make([]Permission, 0)
	permissions = append(permissions, added_permissions...)
	permissions = append(permissions, role_permissions...)
	permissions = append(permissions, platform_permission...)

	return permissions, nil
}

func (r Repository) ListPossibleScopes(project_id, permission_id string) ([]PossibleScope, error) {
	rows, sqlErr := r.Database.Query(listPossibleScopesForPermissionAndProjectQuery, project_id, permission_id)
	if sqlErr != nil && sqlErr != sql.ErrNoRows {
		return nil, sqlErr
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	scopes := make([]PossibleScope, 0)

	var (
		id   string
		name string
	)
	for rows.Next() {
		if err := rows.Scan(&id, &name); err != nil {
			return nil, err
		}

		scopes = append(scopes, PossibleScope{ID: id, Name: name})
	}

	return scopes, nil
}

func (r Repository) AddScopedPermissionForPojectUser(project_id, user_id, realm, permission_id, scope string, wildcard bool) error {
	_, sqlErr := r.Database.Exec(createProjectPermissionForUser, user_id, project_id, permission_id, wildcard, scope)

	if sqlErr != nil {
		return sqlErr
	}

	return nil
}

func (r Repository) DeleteScopedPermissionForPojectUser(project_id, user_id, permission_id, scope string) error {
	rows, sqlErr := r.Database.Query(findAdditionalPermissionForUser, project_id, user_id, permission_id, scope)
	if sqlErr != nil {
		return sqlErr
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	if !rows.Next() {
		return fmt.Errorf("Permission not found")
	}
	_, sqlErr = r.Database.Exec(deleteAdditionalPermissionForuser, scope)

	if sqlErr != nil {
		return sqlErr
	}

	return nil
}
