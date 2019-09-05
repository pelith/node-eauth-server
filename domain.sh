#!/bin/bash

old_domain="wb.local" 
new_domain="your.domain"

files=(
    "docker-compose.yml"
    "domain.sh"
)

for file in ${files[@]}; do
    sed -i "s/${old_domain}/${new_domain}/g" ${file}
done

