echo "mountain-59%-rocket" | sudo -S -u postgres psql -c "CREATE DATABASE ai_gmail_assistant;"
echo "mountain-59%-rocket" | sudo -S -u postgres psql -c "CREATE USER ai_user WITH PASSWORD 'ai_password_123';"
echo "mountain-59%-rocket" | sudo -S -u postgres psql -c "ALTER DATABASE ai_gmail_assistant OWNER TO ai_user;"
echo "mountain-59%-rocket" | sudo -S sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/16/main/postgresql.conf
echo "mountain-59%-rocket" | sudo -S bash -c 'echo "host all all 0.0.0.0/0 md5" >> /etc/postgresql/16/main/pg_hba.conf'
echo "mountain-59%-rocket" | sudo -S systemctl restart postgresql
echo "mountain-59%-rocket" | sudo -S sed -i "s/bind 127.0.0.1 -::1/bind 0.0.0.0/g" /etc/redis/redis.conf
echo "mountain-59%-rocket" | sudo -S sed -i "s/^bind 127.0.0.1/bind 0.0.0.0/g" /etc/redis/redis.conf
echo "mountain-59%-rocket" | sudo -S sed -i "s/# requirepass foobared/requirepass redis_pass_321/g" /etc/redis/redis.conf
echo "mountain-59%-rocket" | sudo -S systemctl restart redis-server
echo "mountain-59%-rocket" | sudo -S ufw allow 5432/tcp
echo "mountain-59%-rocket" | sudo -S ufw allow 6379/tcp
