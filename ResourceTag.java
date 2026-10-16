package com.ctrlf.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "ResourceTags")
public class ResourceTag {
    @Id
    @Column(name = "TagName", length = 80)
    private String tagName;
    @Column(name = "GroupName", nullable = false, length = 40)
    private String groupName;
    @Column(name = "GroupOrder", nullable = false)
    private int groupOrder;
    @Column(name = "TagOrder", nullable = false)
    private int tagOrder;

    protected ResourceTag() {}
    public ResourceTag(String tagName, String groupName, int groupOrder, int tagOrder) {
        this.tagName = tagName;
        this.groupName = groupName;
        this.groupOrder = groupOrder;
        this.tagOrder = tagOrder;
    }
    public String getTagName() { return tagName; }
    public String getGroupName() { return groupName; }
}
