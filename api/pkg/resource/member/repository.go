package member

import (
	"database/sql"
	"time"

	"fmt"
	"net/http"
	"strings"

	"github.com/eneries/eneries/api/pkg/resource/permission"
	"github.com/eneries/eneries/api/pkg/utils"

	"github.com/google/uuid"

	"github.com/eneries/eneries/api/pkg/resource/notification"
)

const (
	createMemberQuery = "INSERT INTO project_user_role (user_id, project_id, role_id, realm) VALUES ($1, $2, $3, $4)"
	updateMemberQuery = "UPDATE project_user_role SET role_id=$1 WHERE project_id=$2 AND user_id=$3 and realm=$4"
	deleteMemberQuery = "DELETE FROM project_user_role WHERE user_id=$1 AND project_id=$2 and realm=$3"
	// base SQL query to select all members, is_admin as bool, is_owner as bool and their role for a project (given by project id as first paramter)
	baseGetMemberQuery = `SELECT 
	user_id, 
	case when role_id = 'projectAdmin' then true else false end as is_admin, 
	case when (SELECT COUNT(*) FROM project WHERE owner_id = user_id AND id = $1) > 0 THEN true ELSE false end as is_owner,
	role_id as "role" 
	FROM project_user_role 
	WHERE project_id=$1 `
	// UNION SQL query to add an platform admin to an baseGetMemberQuery,
	// uses UserID (second SQL paramter) to only include one admin & project id (first SQL parameter) to filter for realm
	baseGetMemberQueryPlatformAdmins = `UNION 
	SELECT user_id, true as is_admin, true as is_owner, role_id as role 
	FROM public.user_role
	JOIN  project on user_role.realm = project.realm 
	WHERE project.id = $1 AND user_id = $2 AND role_id = 'adminUser';`
	getMemberQuery        = baseGetMemberQuery + "AND user_id=$2 " + baseGetMemberQueryPlatformAdmins
	listMemberQuery       = baseGetMemberQuery + baseGetMemberQueryPlatformAdmins
	countQuery            = "SELECT COUNT(*) FROM project_user_role WHERE project_id=$1"
	adminCountQuery       = "SELECT COUNT(*) FROM project_user_role WHERE project_id=$1 and role_id = 'projectAdmin'"
	setOwnerQuery         = "UPDATE project SET owner_id = $1 WHERE id = $2"
	inviteMemberQuery     = "INSERT INTO project_invite (id, project_id, created_by, created_at, email) VALUES($1, $2, $3, now(), $4);"
	getEmailTemplateQuery = "SELECT email FROM email_template WHERE name = $2 and realm = $1"
)

type Repository struct {
	Database        *sql.DB
	SendgridConfigs map[string]notification.SendgridConfig
}
type Member struct {
	ID          string                  `json:"id"`
	Admin       bool                    `json:"admin"`
	Owner       bool                    `json:"owner"`
	FirstName   *string                 `json:"first_name,omitempty"`
	LastName    *string                 `json:"last_name,omitempty"`
	Email       *string                 `json:"email,omitempty"`
	Role        *string                 `json:"role,omitempty"`
	Permissions []permission.Permission `json:"permissions,omitempty"`
}
type GetOptions struct {
	ID        string `json:"id"`
	ProjectID string `json:"project_id"`
}
type ListOptions struct {
	ProjectID string `json:"project_id"`
	UserID    string
}
type CountOptions = ListOptions
type CreateOptions struct {
	ID        string `json:"id"`
	ProjectID string `json:"project_id"`
	Role      string `json:"role"`
	Realm     string `json:"realm"`
}
type SetOwnerOptions struct {
	ID        string `json:"id"`
	ProjectID string `json:"project_id"`
}
type AdminCountOptions struct {
	ProjectID string `json:"project_id"`
}
type UpdateOptions struct {
	ID        string `json:"id"`
	ProjectID string `json:"project_id"`
	Role      string `json:"role"`
	Realm     string `json:"realm"`
	Owner     *bool  `json:"owner"`
}
type DeleteOptions struct {
	ID        string `json:"id"`
	ProjectID string `json:"project_id"`
	Realm     string `json:"realm"`
}
type Options struct {
	ID        string `json:"id"`
	ProjectID string `json:"project_id"`
	Admin     *bool  `json:"admin"`
	Owner     *bool  `json:"owner"`
}

func (r Repository) Get(o GetOptions) (Member, error) {
	rows, err := r.Database.Query(getMemberQuery, o.ProjectID, o.ID)
	if err != nil {
		return Member{}, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	if !rows.Next() {
		return Member{}, utils.NotFoundError{}
	}

	var m Member
	if err := rows.Scan(&m.ID, &m.Admin, &m.Owner, &m.Role); err != nil {
		return Member{}, err
	}

	return m, nil
}

func (r Repository) List(o ListOptions) ([]Member, error) {
	rows, err := r.Database.Query(listMemberQuery, o.ProjectID, o.UserID)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	members := make([]Member, 0)
	for rows.Next() {
		var m Member

		if err := rows.Scan(&m.ID, &m.Admin, &m.Owner, &m.Role); err != nil {
			return nil, err
		}
		members = append(members, m)
	}

	return members, nil
}
func (r Repository) Create(o CreateOptions) (Member, error) {
	_, err := r.Database.Exec(createMemberQuery, o.ID, o.ProjectID, o.Role, o.Realm)
	if err != nil {
		return Member{}, err
	}

	return r.Get(GetOptions{ID: o.ID, ProjectID: o.ProjectID})
}
func (r Repository) SetOwner(o SetOwnerOptions) (Member, error) {
	_, err := r.Database.Exec(setOwnerQuery, o.ID, o.ProjectID)
	if err != nil {
		return Member{}, err
	}

	return r.Get(GetOptions{ID: o.ID, ProjectID: o.ProjectID})
}
func (r Repository) AdminCount(o AdminCountOptions) (int, error) {
	var count int
	err := r.Database.QueryRow(adminCountQuery, o.ProjectID).Scan(&count)

	return count, err
}
func (r Repository) Update(o UpdateOptions) (Member, error) {
	_, err := r.Database.Exec(updateMemberQuery, o.Role, o.ProjectID, o.ID, o.Realm)
	if err != nil {
		return Member{}, err
	}

	return r.Get(GetOptions{ID: o.ID, ProjectID: o.ProjectID})
}
func (r Repository) Delete(o DeleteOptions) error {
	_, err := r.Database.Exec(deleteMemberQuery, o.ID, o.ProjectID, o.Realm)
	return err
}

func (r Repository) Count(o CountOptions) (int, error) {
	var (
		count int
		err   error
	)

	err = r.Database.QueryRow(countQuery, o.ProjectID).Scan(&count)
	return count, err
}

type InviteOptions struct {
	ProjectID string `json:"project_id"`
	Email     string `json:"email"`
	Realm     string
	CreatedBy string
}

func (r Repository) InviteMember(o InviteOptions) error {
	id := uuid.New().String()

	if _, err := r.Database.Exec(inviteMemberQuery, id, o.ProjectID, o.CreatedBy, o.Email); err != nil {
		return err
	}

	return r.SendEmail(o.Realm, "invite", o.Email, map[string]string{
		"REGISTERID": id,
	})
}

func (r Repository) SendEmail(realm, email_name, to string, replaceMap map[string]string) error {
	urlStr := "https://api.sendgrid.com/v3/mail/send"

	realmSendgridConfig, exists := r.SendgridConfigs[realm]
	if !exists {
		return fmt.Errorf("the realm %v was not found in the sendgrid configs", realm)
	}
	sendgridSender := realmSendgridConfig.SendgridSender
	sendgridApiKey := realmSendgridConfig.SendgridApiKey

	row := r.Database.QueryRow(getEmailTemplateQuery, realm, email_name)

	template := ""

	if err := row.Scan(&template); err != nil {
		return err
	}

	if template == "" {
		return fmt.Errorf("template not found")
	}

	body := template
	for key, value := range replaceMap {
		body = strings.Replace(body, key, value, -1)
	}

	subject := "You got invited!"
	emailOptions := notification.SendgridEmailOptions{
		Personalizations: []notification.PersonalizationType{{To: []notification.EmailType{{Email: to}}}},
		From:             notification.EmailType{Email: sendgridSender},
		Subject:          subject,
		Content:          []notification.ContentType{{Type: "text/html", Value: body}},
	}

	respData, err := utils.MakeHttpRequest[string]("POST", urlStr, emailOptions, http.Header{
		"Authorization": {fmt.Sprintf("Bearer %v", sendgridApiKey)},
	}, true)

	if err != nil {
		return err
	}

	l := utils.GetLogger()
	l.Info().Str("recipients", to).Str("subject", subject).Str("response", string(respData)).Msg("email sent successfully")

	return nil
}

const (
	inviteInfoQuery = `SELECT invite.id, invite.email,invite.created_by , p.id as project_id,  p."name" as project_name, invite.used_at 
	FROM project_invite invite
	JOIN project p on invite.project_id = p.id 
	WHERE invite.id = $1 and p.realm  = $2 `
	updateInviteInfoQuery = "UPDATE project_invite SET used_at = now() WHERE id = $1 "
)

type InviteInfo struct {
	ProjectID   string
	Email       string     `json:"email"`
	ProjectName string     `json:"project_name"`
	InvitedBy   string     `json:"inviter"`
	UsedAt      *time.Time `json:"used_at"`
	ID          string
}

func (r Repository) GetInviteInfo(realm, inviteId string) (InviteInfo, error) {
	row := r.Database.QueryRow(inviteInfoQuery, inviteId, realm)
	info := InviteInfo{}
	var usedAt sql.NullTime

	if err := row.Scan(&info.ID, &info.Email, &info.InvitedBy, &info.ProjectID, &info.ProjectName, &usedAt); err != nil {
		return info, err
	}

	if usedAt.Valid {
		info.UsedAt = &usedAt.Time
	}

	return info, nil
}

// returns true if invite exists and is not used
func (r Repository) IsValidInvite(realm, inviteId string) bool {
	info, err := r.GetInviteInfo(realm, inviteId)
	if err != nil {
		return false
	}

	return !r.isInviteUsed(&info)
}

func (r Repository) isInviteUsed(info *InviteInfo) bool {
	if info.UsedAt != nil && !info.UsedAt.IsZero() {
		return true
	}
	return false
}

func (r Repository) AddInvitedMemberToProject(realm, inviteId, userId string) error {
	info, err := r.GetInviteInfo(realm, inviteId)

	if err != nil {
		return err
	}

	if r.isInviteUsed(&info) {
		return fmt.Errorf("invite already used")
	}

	_, err = r.Database.Exec(createMemberQuery, userId, info.ProjectID, "projectUser", realm)
	if err != nil {
		return err
	}

	_, err = r.Database.Exec(updateInviteInfoQuery, info.ID)
	if err != nil {
		return err
	}

	return nil
}
