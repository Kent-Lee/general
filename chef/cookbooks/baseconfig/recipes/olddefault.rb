# Make sure the Apt package lists are up to date, so we're downloading versions that exist.
cookbook_file "apt-sources.list" do
  path "/etc/apt/sources.list"
end
execute 'apt_update' do
  command 'apt-get update'
end

# Base configuration recipe in Chef.
package "wget"
package "ntp"
package "build-essential"
package "sqlite3"
package "libsqlite3-dev"
package "zlib1g-dev"
package "postgresql"

cookbook_file "ntp.conf" do
  path '/etc/ntp.conf'
end
execute 'ntp_restart' do
  command 'service ntp restart'
end
execute 'add node repo' do
  command 'curl -sL https://deb.nodesource.com/setup_8.x | bash -'
end
execute 'apt_update' do
  command 'apt-get update'
end

package "nginx" do
    action :install
end

#Override the default nginx config with the one in our cookbook.
cookbook_file "nginx-default" do
   path "/etc/nginx/sites-available/default"
end

#Reload nginx to pick up new nginx config

service "nginx" do
    action :reload
end

execute 'install node' do
  command 'sudo apt-get install nodejs -y'
end

# NPM install for client and server
#execute "npm_install_server" do
#    cwd "/home/ubuntu/project/app"
#    command "sudo npm install"
#end

# NPM install for client and server
execute "install sequelize" do
    cwd "/home/ubuntu/project/app"
    command "sudo npm install sequelize"
end

execute 'pg_user' do
    command 'sudo -u postgres psql -c "CREATE ROLE ubuntu LOGIN PASSWORD \'password\';"'
end

# Create database for app
execute 'pg_db' do
    command 'sudo -u postgres psql -c "CREATE DATABASE generals OWNER ubuntu;"'
end



#execute 'node server up' do
#    cwd '/home/ubuntu/project/app'
#   command 'node index.js'
#end
