def create_txt_file(prefix):
    with open(f"{prefix}_file.txt", "w") as file:
        for i in range(10000):
            entry = f"{prefix}{str(i).zfill(4)}\n"
            file.write(entry)

if __name__ == '__main__':
    user_prefix = input("Enter the prefix: ")
    create_txt_file(user_prefix)
