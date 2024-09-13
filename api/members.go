package main

import (
	"encoding/json"
	"net/http"
	"sort"
	"strings"
	"sync"

	"github.com/efficientIO/efficientIO/api/pkg/resource/member"
	"github.com/efficientIO/efficientIO/api/pkg/resource/project"
	"github.com/efficientIO/efficientIO/api/pkg/resource/user"
	"github.com/efficientIO/efficientIO/api/pkg/utils"
	"golang.org/x/exp/slices"

	"github.com/gorilla/mux"
)

// membersCreateHandler creates a new member for a project.
// @Summary      Create member
//
//	@Description  Create a new member for a project
//	@Tags         Members
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Param        opts body member.CreateOptions true "Member creation options"
//	@Produce      json
//	@Success      200  {object}  member.Member "Created member"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/members [post]
func membersCreateHandler(w http.ResponseWriter, r *http.Request) {
	projectID := mux.Vars(r)["project_id"]
	realm := r.Header.Get("x-realm")

	var opts member.CreateOptions
	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	// validate if the members can be added...
	limits, err := projectRepo.Limits(project.LimitOptions{ID: projectID})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	count, err := memberRepo.Count(member.CountOptions{ProjectID: projectID})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	if count >= limits.Members {
		reject(w, r, http.StatusBadRequest, "limit reached")
		return
	}

	// now get the user and check if he has already reached his project quota
	u, err := userRepo.Get(user.GetOptions{Realm: realm, ID: opts.ID, PrivateInfo: true})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	pc, err := userRepo.ProjectCount(user.ProjectCountOptions{ID: u.ID})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	if pc >= u.Limits.Projects {
		reject(w, r, http.StatusBadRequest, "user has project limit reached")
		return
	}

	opts.ProjectID = projectID
	opts.Realm = realm

	m, err := memberRepo.Create(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	m.FirstName = &u.FirstName
	m.LastName = &u.LastName
	m.Email = &u.Email

	respond(w, http.StatusOK, m)
}

// membersUpdateHandler updates a member's information in the specified project.
// @Summary      Update member
//
//	@Description  Update a member's information in a project
//	@Tags         Members
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Param        member_id path string true "Member ID"
//	@Param        opts body member.UpdateOptions true "Member update options"
//	@Produce      json
//	@Success      200  {object}  member.Member "Updated member"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/members/{member_id} [put]
func membersUpdateHandler(w http.ResponseWriter, r *http.Request) {
	// TODO from # 90bf475 - make this better
	projectID := mux.Vars(r)["project_id"]
	memberID := mux.Vars(r)["member_id"]
	realm := r.Header.Get("x-realm")

	var opts member.UpdateOptions
	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	opts.ProjectID = projectID
	opts.ID = memberID
	opts.Realm = realm

	// request for updating/setting owner
	// TODO: can this be delted????
	if opts.Owner != nil && *opts.Owner {
		// owner can only given to the requester
		if !strings.EqualFold(memberID, r.Header.Get("x-user")) {
			reject(w, r, http.StatusBadRequest, "you can only give yourself owner")
			return
		}

		// set owner
		m, err := memberRepo.SetOwner(member.SetOwnerOptions{ID: memberID, ProjectID: projectID})
		if err != nil {
			reject(w, r, http.StatusInternalServerError, err.Error())
			return
		}

		// set user information
		u, err := userRepo.Get(user.GetOptions{Realm: realm, ID: opts.ID})
		if err != nil {
			reject(w, r, http.StatusInternalServerError, err.Error())
			return
		}
		m.FirstName = &u.FirstName
		m.LastName = &u.LastName
		m.Email = &u.Email

		respond(w, http.StatusOK, m)
		return
	}

	if strings.EqualFold(memberID, r.Header.Get("x-user")) {
		reject(w, r, http.StatusBadRequest, "cannot remove own user")
		return
	}

	m, err := memberRepo.Get(member.GetOptions{
		ID:        opts.ID,
		ProjectID: opts.ProjectID,
	})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	// you cannot take admin from owner
	if m.Owner && opts.Role != "projectAdmin" {
		reject(w, r, http.StatusBadRequest, "owner must be admin")
		return
	}

	// update member
	m, err = memberRepo.Update(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	// fetch user information from keycloak
	u, err := userRepo.Get(user.GetOptions{Realm: realm, ID: opts.ID})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	m.FirstName = &u.FirstName
	m.LastName = &u.LastName
	m.Email = &u.Email

	respond(w, http.StatusOK, m)
}

// membersDeleteHandler deletes a member from a project
// @Summary      Delete a member
//
//	@Description  Delete a member from a project
//	@Tags         Members
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Param        member_id path string true "Member ID"
//	@Success      200  {object}  map[string]string "Member deleted successfully"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/members/{member_id} [delete]
func membersDeleteHandler(w http.ResponseWriter, r *http.Request) {
	memberID := mux.Vars(r)["member_id"]
	projectID := mux.Vars(r)["project_id"]
	opts := member.GetOptions{
		ProjectID: projectID,
		ID:        r.Header.Get("x-user"),
	}

	// get the current x-user that is trying to delete the member
	cm, err := memberRepo.Get(opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	// now set the options id to our member we want to delete
	opts.ID = memberID

	if !cm.Admin && cm.ID != strings.ToLower(memberID) {
		reject(w, r, http.StatusUnauthorized, "you cannot remove other users, you are not an admin")
		return
	} else if cm.Admin {
		if err != nil {
			reject(w, r, http.StatusInternalServerError, err.Error())
			return
		}

		if cm.Owner {
			if cm.ID == strings.ToLower(memberID) {
				reject(w, r, http.StatusInternalServerError, "you cannot leave the project since you are the owner")
				return
			}
		}
	}

	if err := memberRepo.Delete(member.DeleteOptions{ID: memberID, ProjectID: projectID,
		Realm: r.Header.Get("x-realm")}); err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
	}
}

// membersListHandler retrieves a list of members for a project.
// @Summary      List members
//
//	@Description  Retrieve a list of members for a project
//	@Tags         Members
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Produce      json
//	@Success      200  {object}  []member.Member "List of members"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/members [get]
func membersListHandler(w http.ResponseWriter, r *http.Request) {
	projectID := mux.Vars(r)["project_id"]
	realm := r.Header.Get("x-realm")
	userID := r.Header.Get("x-user")

	members, err := memberRepo.List(member.ListOptions{ProjectID: projectID, UserID: userID})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	var wg sync.WaitGroup
	var errs []error
	var indicesToDelete []int
	for i := range members {
		wg.Add(1)

		go func(i int) {
			defer wg.Done()

			u, err := userRepo.Get(user.GetOptions{ID: members[i].ID, Realm: realm})
			if err != nil {
				if err.Error() == "404 Not Found: User not found" {
					// delete this index from the members return value if the user was deleted in keycloak ...
					indicesToDelete = append(indicesToDelete, i)
					// ... try to delete user from database as this user was deleted in keycloak
					err := memberRepo.Delete(member.DeleteOptions{ID: members[i].ID, ProjectID: projectID, Realm: realm})
					if err != nil {
						l := utils.GetLogger()
						l.Error().Err(err).Msg("")
					}
				} else {
					errs = append(errs, err)
				}
			}
			members[i].FirstName = &u.FirstName
			members[i].LastName = &u.LastName
			members[i].Email = &u.Email
		}(i)
	}
	wg.Wait()

	// sort indices descending, delete members that were deleted
	sort.Sort(sort.Reverse(sort.IntSlice(indicesToDelete)))
	for _, index := range indicesToDelete {
		members = slices.Delete(members, index, index+1)
	}

	if len(errs) > 0 {
		respond(w, http.StatusInternalServerError, errs)
		return
	}

	respond(w, http.StatusOK, members)
}

// membersGetHandler retrieves information about a specific member in a project.
// @Summary      Get member information
//
//	@Description  Retrieves information about a specific member in a project.
//	@Tags         Members
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Param        member_id path string true "Member ID"
//	@Produce      json
//	@Success      200  {object}  member.Member "Member information"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/members/{member_id} [get]
func membersGetHandler(w http.ResponseWriter, r *http.Request) {
	projectId := mux.Vars(r)["project_id"]
	memberId := mux.Vars(r)["member_id"]
	realm := r.Header.Get("x-realm")

	m, err := memberRepo.Get(member.GetOptions{ProjectID: projectId, ID: memberId})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	u, err := userRepo.Get(user.GetOptions{Realm: realm, ID: memberId})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	m.FirstName = &u.FirstName
	m.LastName = &u.LastName
	m.Email = &u.Email

	permissions, err := permissionRepo.ListPermissionsForMember(projectId, memberId)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	m.Permissions = permissions

	respond(w, http.StatusOK, m)
}

// membersInviteHandler invites a user to a project and creates a member if the user does not exist
// @Summary      Invite member to project
//
//	@Description  Invites a user to a project and creates a member if the user does not exist
//	@Tags         Members
//	@Accept       json
//	@Param        project_id path string true "Project ID"
//	@Param        body body member.InviteOptions true "Invite options"
//	@Produce      json
//	@Success      200  {object}  nil
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /projects/{project_id}/members/invite [post]
func membersInviteHandler(w http.ResponseWriter, r *http.Request) {
	projectId := mux.Vars(r)["project_id"]
	realm := r.Header.Get("x-realm")
	userID := r.Header.Get("x-user")

	var opts member.InviteOptions
	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	o := member.InviteOptions{
		ProjectID: projectId,
		Email:     opts.Email,
		Realm:     realm,
		CreatedBy: userID,
	}

	users, err := userRepo.List(user.ListOptions{
		Realm: realm,
		Email: o.Email,
	})

	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	for _, u := range users {
		if u.Email != o.Email {
			continue
		}

		_, err := memberRepo.Get(member.GetOptions{ProjectID: projectId, ID: u.ID})
		if err == nil {
			continue
		}

		if _, ok := err.(utils.NotFoundError); !ok {
			reject(w, r, http.StatusInternalServerError, err.Error())
			return
		}

		permissionRepo.CreateUserIfNotExists(u.ID, realm)

		_, err = memberRepo.Create(member.CreateOptions{
			ID:        u.ID,
			Realm:     realm,
			ProjectID: o.ProjectID,
			Role:      "projectUser",
		})

		if err != nil {
			reject(w, r, http.StatusInternalServerError, err.Error())
			return
		}

		respond(w, http.StatusOK, nil)
		return
	}

	err = memberRepo.InviteMember(o)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, nil)
}
