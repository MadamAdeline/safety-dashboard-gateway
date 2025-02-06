import { DashboardLayout } from "@/components/DashboardLayout";
import { UserList } from "@/components/users/UserList";
import { UserActions } from "@/components/users/UserActions";
import { useState } from "react";
import { UserForm } from "@/components/users/UserForm";

export default function Users() {
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <DashboardLayout>
      {showNewUserForm || selectedUser ? (
        <UserForm
          onClose={() => {
            setShowNewUserForm(false);
            setSelectedUser(null);
          }}
          initialData={selectedUser}
        />
      ) : (
        <>
          <div className="mb-6">
            <UserActions onNewUser={() => setShowNewUserForm(true)} />
          </div>
          <UserList onEdit={setSelectedUser} />
        </>
      )}
    </DashboardLayout>
  );
}